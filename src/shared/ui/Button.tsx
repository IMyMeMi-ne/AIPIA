import type { ButtonHTMLAttributes } from 'react'
import { className } from './className'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--ds-color-accent)] text-[var(--ds-color-accent-foreground)] hover:bg-[var(--ds-color-accent-hover)]',
  secondary:
    'border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] text-app-foreground hover:bg-[var(--ds-color-surface-muted)]',
  ghost: 'text-app-foreground hover:bg-[var(--ds-color-surface-muted)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-sm',
  md: 'min-h-10 px-4 text-sm',
}

export function Button({
  className: extraClassName,
  type = 'button',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={className(
        'inline-flex items-center justify-center gap-2 rounded-[var(--ds-radius-control)] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        extraClassName,
      )}
      type={type}
      {...props}
    />
  )
}
