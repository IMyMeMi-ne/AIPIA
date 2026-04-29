import { Skeleton } from '@/shared/ui/Skeleton.tsx';

const STORY_SKELETON_COUNT = 9;

function StoryMetaSkeleton() {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="size-1.5 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

function StoryCardSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden lg:h-full lg:rounded-(--ds-radius-card) lg:border lg:border-(--ds-color-border) lg:bg-(--ds-color-surface) lg:shadow-sm">
      <div className="grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)] gap-3 py-4 lg:flex lg:h-full lg:flex-col lg:gap-0 lg:py-0">
        <div className="relative h-20 overflow-hidden rounded-(--ds-radius-sm) bg-(--ds-color-surface-muted) lg:aspect-3/2 lg:h-auto lg:rounded-none">
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        </div>
        <article className="flex h-full min-w-0 flex-col border-l-2 border-transparent pl-3 lg:flex-1 lg:gap-4 lg:border-l-0 lg:p-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          <div className="mt-auto pt-2">
            <StoryMetaSkeleton />
          </div>
        </article>
      </div>
    </div>
  );
}

function StoryGridSkeleton() {
  return (
    <div aria-live="polite" role="status">
      <span className="sr-only">Loading stories...</span>

      <div
        aria-hidden="true"
        className="grid gap-0 divide-y divide-(--ds-color-border) border-y border-(--ds-color-border) lg:grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] lg:gap-5 lg:divide-y-0 lg:border-y-0"
      >
        {Array.from({ length: STORY_SKELETON_COUNT }, (_, index) => (
          <StoryCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export default StoryGridSkeleton;
