import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY } from '@/shared/theme/index.ts'

function runPrePaintThemeScript() {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
  const scriptMatch = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)

  if (scriptMatch === null) {
    throw new Error('Pre-paint theme script not found')
  }

  window.eval(scriptMatch[1])
}

describe('pre-paint theme script contract', () => {
  it('defaults to light without consulting OS color scheme', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    runPrePaintThemeScript()

    expect(window.matchMedia).not.toHaveBeenCalled()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('applies dark only when dark is stored', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    runPrePaintThemeScript()

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })
})
