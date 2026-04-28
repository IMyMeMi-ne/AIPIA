import { Skeleton } from '@/shared/ui/Skeleton.tsx'
import { Surface } from '@/shared/ui/Surface.tsx'

const DETAIL_ITEM_SKELETON_COUNT = 3

function StoryDetailSkeleton() {
  return (
    <Surface aria-live="polite" className="overflow-hidden" elevated role="status">
      <span className="sr-only">Loading story detail...</span>

      <article className="flex flex-col gap-6 p-5 sm:gap-7 sm:p-6">
        <div className="max-w-(--ds-layout-readable-max) space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full sm:h-9" />
            <Skeleton className="h-8 w-11/12 sm:h-9" />
            <Skeleton className="h-8 w-3/5 sm:h-9" />
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: DETAIL_ITEM_SKELETON_COUNT }, (_, index) => (
            <div
              className="min-w-0 rounded-[var(--ds-radius-card)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-muted)] p-4"
              key={index}
            >
              <Skeleton className="mb-2 h-3 w-20 bg-[var(--ds-color-border)]" />
              <Skeleton className="h-5 w-28 bg-[var(--ds-color-border)]" />
            </div>
          ))}
        </dl>

        <section className="min-w-0 rounded-(--ds-radius-card) border border-(--ds-color-border) p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
            <div className="shrink-0">
              <Skeleton className="h-10 w-full sm:w-44" />
            </div>
          </div>
        </section>
      </article>
    </Surface>
  )
}

export default StoryDetailSkeleton
