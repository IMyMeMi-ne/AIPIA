import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext.ts'
import { applyResolvedTheme, resolveThemePreference } from './resolveTheme.ts'
import { readStoredThemePreference, writeStoredThemePreference } from './storage.ts'
import type { ThemePreference } from './types.ts'

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readStoredThemePreference())
  const resolvedTheme = resolveThemePreference(preference)

  useEffect(() => {
    applyResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference)
    writeStoredThemePreference(nextPreference)
  }, [])

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
