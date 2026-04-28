import { useContext } from 'react'
import { ThemeContext } from './ThemeContext.ts'

export function useTheme() {
  const contextValue = useContext(ThemeContext)

  if (contextValue === null) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return contextValue
}
