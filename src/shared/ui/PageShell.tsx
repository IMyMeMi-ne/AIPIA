import type { ReactNode } from 'react'
import { useId } from 'react'
import { className } from './className'

type PageShellProps = {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageShell({
  title,
  eyebrow,
  description,
  actions,
  children,
  className: extraClassName,
}: PageShellProps) {
  const titleId = useId()

  return (
    <main
      aria-labelledby={titleId}
      className={className('min-h-screen bg-app-background text-app-foreground', extraClassName)}
    >
      <div className="mx-auto flex w-full max-w-(--ds-layout-page-max) flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-(--ds-color-border) pb-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-(--ds-layout-readable-max) space-y-2">
            {eyebrow ? <p className="m-0 text-sm font-semibold text-app-muted">{eyebrow}</p> : null}
            <h1
              className="m-0 text-(length:--ds-font-size-display) font-bold leading-(--ds-line-height-tight) text-app-foreground"
              id={titleId}
            >
              {title}
            </h1>
            {description ? <p className="m-0 text-base leading-7 text-app-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">{actions}</div> : null}
        </header>
        {children ? <div className="min-w-0">{children}</div> : null}
      </div>
    </main>
  )
}
