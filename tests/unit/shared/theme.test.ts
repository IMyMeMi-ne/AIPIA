import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME_PREFERENCE,
  readStoredThemePreference,
  resolveThemePreference,
  THEME_STORAGE_KEY,
  writeStoredThemePreference,
} from '@/shared/theme/index.ts'

describe('theme storage helpers', () => {
  it('returns the default light preference when storage is empty or invalid', () => {
    expect(readStoredThemePreference()).toBe(DEFAULT_THEME_PREFERENCE)

    window.localStorage.setItem(THEME_STORAGE_KEY, 'auto')
    expect(readStoredThemePreference()).toBe(DEFAULT_THEME_PREFERENCE)

    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia')
    expect(readStoredThemePreference()).toBe(DEFAULT_THEME_PREFERENCE)
  })

  it('persists valid light and dark theme preferences', () => {
    writeStoredThemePreference('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(readStoredThemePreference()).toBe('dark')

    writeStoredThemePreference('light')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(readStoredThemePreference()).toBe('light')
  })
})

describe('theme resolution helpers', () => {
  it('uses explicit light and dark preferences as the active theme', () => {
    expect(resolveThemePreference('light')).toBe('light')
    expect(resolveThemePreference('dark')).toBe('dark')
  })
})
