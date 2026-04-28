import type { HTMLAttributes } from 'react'
import { className } from './className'

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean
}

export function Surface({ className: extraClassName, elevated = false, ...props }: SurfaceProps) {
  return (
    <div
      className={className(
        'rounded-[var(--ds-radius-card)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)]',
        elevated ? 'shadow-[var(--ds-shadow-card)]' : 'shadow-sm',
        extraClassName,
      )}
      {...props}
    />
  )
}
