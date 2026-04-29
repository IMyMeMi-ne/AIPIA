import { useTheme } from '@/shared/theme/index.ts'
import { className } from './className'

function LightThemeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      data-testid="light-theme-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function DarkThemeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      data-testid="dark-theme-icon"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20.2 15.4A8.42 8.42 0 0 1 8.6 3.8a.75.75 0 0 0-.78-1.19 10 10 0 1 0 13.57 13.57.75.75 0 0 0-1.19-.78Z" />
    </svg>
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setPreference } = useTheme()
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  const label = nextTheme === 'dark' ? 'Switch to dark theme' : 'Switch to light theme'

  return (
    <button
      aria-label={label}
      className={className(
        'inline-flex size-9 items-center justify-center rounded-full border border-(--ds-color-border) bg-(--ds-color-surface-muted) text-app-muted shadow-(--ds-shadow-tab) transition-[background-color,color,box-shadow,transform] hover:-translate-y-px hover:bg-(--ds-color-surface) hover:text-app-foreground lg:size-12.5',
        'focus-visible:ring-2 focus-visible:ring-(--ds-color-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ds-color-background)',
      )}
      onClick={() => setPreference(nextTheme)}
      title={label}
      type="button"
    >
      {resolvedTheme === 'dark' ? <DarkThemeIcon /> : <LightThemeIcon />}
    </button>
  )
}

export default ThemeToggle
