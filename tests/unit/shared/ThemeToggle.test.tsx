import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, THEME_STORAGE_KEY } from '@/shared/theme/index.ts'
import { ThemeToggle } from '@/shared/ui/ThemeToggle.tsx'

function renderThemeToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  it('renders a single icon-only button that defaults to switching to dark', () => {
    renderThemeToggle()

    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
    expect(screen.getByTestId('light-theme-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('dark-theme-icon')).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('toggles between dark and light theme preferences', async () => {
    const user = userEvent.setup()
    renderThemeToggle()

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
    expect(screen.getByTestId('dark-theme-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('light-theme-icon')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
    expect(screen.getByTestId('light-theme-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('dark-theme-icon')).not.toBeInTheDocument()
  })
})
