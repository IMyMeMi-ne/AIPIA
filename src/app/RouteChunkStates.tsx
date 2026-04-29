export function RouteChunkFallback() {
  return (
    <main
      aria-label="Loading page"
      className="min-h-screen bg-app-background px-4 py-6 text-app-foreground sm:px-6 lg:px-8"
    >
      <div
        aria-live="polite"
        className="mx-auto flex min-h-56 w-full max-w-(--ds-layout-readable-max) flex-col items-center justify-center gap-2 rounded-(--ds-radius-card) border border-(--ds-color-border) bg-(--ds-color-surface) p-6 text-center shadow-sm"
        role="status"
      >
        <p className="m-0 text-base font-bold">Loading page...</p>
        <p className="m-0 text-sm text-app-muted">
          Preparing the requested route.
        </p>
      </div>
    </main>
  )
}

export function RouteChunkErrorState() {
  return (
    <main
      aria-label="Page load error"
      className="min-h-screen bg-app-background px-4 py-6 text-app-foreground sm:px-6 lg:px-8"
    >
      <div
        className="mx-auto flex min-h-56 w-full max-w-(--ds-layout-readable-max) flex-col items-center justify-center gap-3 rounded-(--ds-radius-card) border border-(--ds-color-border) bg-(--ds-color-surface) p-6 text-center shadow-sm"
        role="alert"
      >
        <p className="m-0 text-base font-bold text-(--ds-color-danger)">
          Page could not load
        </p>
        <p className="m-0 text-sm text-app-muted">
          Refresh the page or return to the story feed.
        </p>
        <a
          className="rounded-(--ds-radius-control) border border-(--ds-color-border) px-3 py-2 text-sm font-semibold text-app-foreground transition-colors hover:bg-(--ds-color-muted-surface)"
          href="/"
        >
          Back to feed
        </a>
      </div>
    </main>
  )
}
