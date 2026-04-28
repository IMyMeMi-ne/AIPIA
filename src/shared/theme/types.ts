export type ThemePreference = 'light' | 'dark'
export type ResolvedTheme = ThemePreference

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'light'

export const THEME_PREFERENCES = ['light', 'dark'] as const satisfies readonly ThemePreference[]
