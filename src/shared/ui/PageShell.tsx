import type { ReactNode } from 'react';
import { useId } from 'react';
import { className } from './className';

type PageShellProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleActions?: ReactNode;
  children?: ReactNode;
  className?: string;
  descriptionClassName?: string;
  eyebrowClassName?: string;
  onTitleClick?: () => void;
};

export function PageShell({
  title,
  eyebrow,
  description,
  actions,
  titleActions,
  children,
  className: extraClassName,
  descriptionClassName,
  eyebrowClassName,
  onTitleClick,
}: PageShellProps) {
  const titleId = useId();

  return (
    <main
      aria-labelledby={titleId}
      className={className(
        'min-h-screen bg-app-background text-app-foreground',
        extraClassName,
      )}
    >
      <div className="mx-auto flex w-full max-w-(--ds-layout-page-max) flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b-0 border-(--ds-color-border) pb-4 lg:flex-row lg:items-end lg:justify-between lg:pb-5 lg:border-b">
          <div className="flex w-full min-w-0 items-start justify-between gap-3 lg:w-auto lg:max-w-(--ds-layout-readable-max)">
            <div className="min-w-0 space-y-2">
              {eyebrow ? (
                <p
                  className={className(
                    'm-0 text-sm font-semibold text-app-muted',
                    eyebrowClassName,
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className="m-0 text-(length:--ds-font-size-display) font-bold leading-(--ds-line-height-tight) text-app-foreground"
                id={titleId}
              >
                {onTitleClick ? (
                  <button
                    className="cursor-pointer text-left transition-colors hover:text-app-muted"
                    onClick={onTitleClick}
                    type="button"
                  >
                    {title}
                  </button>
                ) : (
                  title
                )}
              </h1>
              {description ? (
                <p
                  className={className(
                    'm-0 text-base leading-7 text-app-muted',
                    descriptionClassName,
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
            {titleActions ? (
              <div className="shrink-0 lg:hidden">{titleActions}</div>
            ) : null}
          </div>
          {actions ? (
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              {titleActions ? (
                <div className="hidden lg:block">{titleActions}</div>
              ) : null}
              {actions}
            </div>
          ) : titleActions ? (
            <div className="hidden flex-wrap items-center gap-2 lg:flex lg:w-auto">
              {titleActions}
            </div>
          ) : null}
        </header>
        {children ? <div className="min-w-0">{children}</div> : null}
      </div>
    </main>
  );
}
