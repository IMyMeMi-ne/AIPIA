import type { ResolvedTheme, ThemePreference } from './types.ts'

export function resolveThemePreference(preference: ThemePreference): ResolvedTheme {
  return preference
}

export function applyResolvedTheme(
  resolvedTheme: ResolvedTheme,
  root = typeof document === 'undefined' ? null : document.documentElement,
) {
  if (root === null) {
    return
  }

  root.dataset.theme = resolvedTheme
  root.style.colorScheme = resolvedTheme
}
