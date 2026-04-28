import { Skeleton } from '@/shared/ui/Skeleton.tsx'
import { Surface } from '@/shared/ui/Surface.tsx'

const COMPACT_STORY_SKELETON_COUNT = 6
const DESKTOP_STORY_SKELETON_COUNT = 8

function StoryMetaSkeleton() {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="size-1.5 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

function FeaturedStoryCardSkeleton() {
  return (
    <Surface className="overflow-hidden border-(--ds-color-border) bg-(--ds-color-surface) shadow-[0_18px_50px_rgb(21_23_26/0.10)]">
      <div className="relative aspect-[1.18] overflow-hidden bg-(--ds-color-surface-muted)">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 bg-linear-to-t from-black/25 via-black/10 to-transparent p-4 pt-16">
          <div className="flex items-center gap-2">
            <Skeleton className="h-px w-7 bg-white/45" />
            <Skeleton className="h-3 w-24 bg-white/45" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-7 w-11/12 bg-white/55" />
            <Skeleton className="h-7 w-4/5 bg-white/55" />
          </div>
        </div>
      </div>
      <article className="p-4">
        <StoryMetaSkeleton />
      </article>
    </Surface>
  )
}

function CompactStoryCardSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)] gap-3 py-4">
      <div className="relative h-20">
        <Skeleton className="h-full w-full rounded-(--ds-radius-sm)" />
      </div>
      <article className="flex h-full min-w-0 flex-col border-l-2 border-transparent pl-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <div className="mt-auto pt-2">
          <StoryMetaSkeleton />
        </div>
      </article>
    </div>
  )
}

function DesktopStoryCardSkeleton() {
  return (
    <Surface className="h-full overflow-hidden border border-(--ds-color-border) bg-(--ds-color-surface)">
      <Skeleton className="aspect-3/2 w-full rounded-none" />
      <article className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <dl className="mt-auto grid gap-2 border-t border-(--ds-color-border) pt-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <Skeleton className="h-3 w-7" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex min-w-0 items-baseline gap-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-4 w-24" />
          </div>
        </dl>
      </article>
    </Surface>
  )
}

function StoryGridSkeleton() {
  return (
    <div aria-live="polite" role="status">
      <span className="sr-only">Loading stories...</span>

      <div aria-hidden="true" className="lg:hidden">
        <FeaturedStoryCardSkeleton />
        <div className="mt-3 divide-y divide-(--ds-color-border) border-y border-(--ds-color-border)">
          {Array.from({ length: COMPACT_STORY_SKELETON_COUNT }, (_, index) => (
            <CompactStoryCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-5 lg:grid"
      >
        {Array.from({ length: DESKTOP_STORY_SKELETON_COUNT }, (_, index) => (
          <DesktopStoryCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

export default StoryGridSkeleton
