import type { HTMLAttributes, ReactNode } from 'react'
import { className } from './className'

type ErrorStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  message?: ReactNode
  action?: ReactNode
}

export function ErrorState({
  action,
  className: extraClassName,
  message,
  title = 'Something went wrong',
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={className(
        'flex min-h-40 flex-col items-center justify-center gap-3 rounded-(--ds-radius-card) border border-(--ds-color-border) bg-(--ds-color-surface) p-6 text-center',
        extraClassName,
      )}
      role="alert"
      {...props}
    >
      <p className="m-0 text-base font-bold text-(--ds-color-danger)">{title}</p>
      {message ? <p className="m-0 max-w-(--ds-layout-readable-max) text-sm text-app-muted">{message}</p> : null}
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}

export default ErrorState
