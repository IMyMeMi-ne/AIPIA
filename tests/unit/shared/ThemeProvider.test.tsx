import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, THEME_STORAGE_KEY, useTheme } from '@/shared/theme/index.ts'

function ThemeProbe() {
  const { preference, resolvedTheme, setPreference } = useTheme()

  return (
    <div>
      <p>Preference: {preference}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setPreference('dark')} type="button">
        Use dark
      </button>
      <button onClick={() => setPreference('light')} type="button">
        Use light
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  it('defaults to light and applies the theme to the document root', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    expect(screen.getByText('Preference: light')).toBeInTheDocument()
    expect(screen.getByText('Resolved theme: light')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('reads stored dark preference and applies it to the document root', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    expect(screen.getByText('Preference: dark')).toBeInTheDocument()
    expect(screen.getByText('Resolved theme: dark')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('persists explicit preference changes', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Use dark' }))

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

    await user.click(screen.getByRole('button', { name: 'Use light' }))

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })
})
