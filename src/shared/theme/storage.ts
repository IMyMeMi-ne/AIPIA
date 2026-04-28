import { DEFAULT_THEME_PREFERENCE, THEME_PREFERENCES, type ThemePreference } from './types.ts'

export const THEME_STORAGE_KEY = 'aipia-theme-preference'

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_PREFERENCES.includes(value as ThemePreference)
}

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readStoredThemePreference(storage = getBrowserStorage()): ThemePreference {
  if (storage === null) {
    return DEFAULT_THEME_PREFERENCE
  }

  try {
    const storedPreference = storage.getItem(THEME_STORAGE_KEY)

    return isThemePreference(storedPreference) ? storedPreference : DEFAULT_THEME_PREFERENCE
  } catch {
    return DEFAULT_THEME_PREFERENCE
  }
}

export function writeStoredThemePreference(
  preference: ThemePreference,
  storage = getBrowserStorage(),
) {
  if (storage === null) {
    return
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Storage can be unavailable in private browsing or locked-down environments.
  }
}
