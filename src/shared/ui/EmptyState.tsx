import type { HTMLAttributes, ReactNode } from 'react'
import { className } from './className'

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  message?: ReactNode
  action?: ReactNode
}

export function EmptyState({
  action,
  className: extraClassName,
  message,
  title = 'No content yet',
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={className(
        'flex min-h-40 flex-col items-center justify-center gap-3 rounded-(--ds-radius-card) border border-dashed border-(--ds-color-border) bg-(--ds-color-surface) p-6 text-center',
        extraClassName,
      )}
      {...props}
    >
      <p className="m-0 text-base font-bold text-app-foreground">{title}</p>
      {message ? <p className="m-0 max-w-(--ds-layout-readable-max) text-sm text-app-muted">{message}</p> : null}
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}

export default EmptyState
