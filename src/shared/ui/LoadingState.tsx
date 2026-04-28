import type { HTMLAttributes } from 'react'
import { className } from './className'

type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  label?: string
}

export function LoadingState({ className: extraClassName, label = 'Loading...', ...props }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className={className(
        'flex min-h-40 flex-col items-center justify-center gap-3 rounded-[var(--ds-radius-card)] border border-dashed border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] p-6 text-center text-app-muted',
        extraClassName,
      )}
      role="status"
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-[var(--ds-color-border)] border-t-[var(--ds-color-accent)]"
      />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}

export default LoadingState
