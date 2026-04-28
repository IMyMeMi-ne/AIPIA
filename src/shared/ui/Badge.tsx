import type { HTMLAttributes } from 'react'
import { className } from './className'

type BadgeVariant = 'neutral' | 'accent' | 'success'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-[var(--ds-color-border)] bg-[var(--ds-color-surface-muted)] text-app-muted',
  accent: 'border-transparent bg-[var(--ds-color-accent-soft)] text-[var(--ds-color-accent)]',
  success: 'border-transparent bg-[var(--ds-color-success-soft)] text-[var(--ds-color-success)]',
}

export function Badge({ className: extraClassName, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={className(
        'inline-flex min-h-6 items-center rounded-(--ds-radius-sm) border px-2 text-xs font-semibold leading-none',
        variantClasses[variant],
        extraClassName,
      )}
      {...props}
    />
  )
}
