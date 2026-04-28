import { Link } from 'react-router-dom'
import { formatUnixSecondsDate } from '../../../shared/lib/date.ts'
import { Surface } from '../../../shared/ui/Surface.tsx'
import { buildStoryThumbnailUrl } from '../lib/story.ts'
import type { HackerNewsStory } from '../model/types.ts'

type StoryCardProps = {
  story: HackerNewsStory
}

function StoryCard({ story }: StoryCardProps) {
  return (
    <Surface className="group h-full overflow-hidden transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-(--ds-shadow-card) focus-within:-translate-y-0.5 focus-within:shadow-(--ds-shadow-card)">
      <Link
        aria-label={`Read story: ${story.title}`}
        className="flex h-full min-w-0 flex-col rounded-[inherit]"
        to={`/stories/${story.id}`}
      >
        <div className="relative aspect-3/2 overflow-hidden bg-(--ds-color-surface-muted)">
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center px-4 text-center text-xs font-semibold text-app-muted"
          >
            Thumbnail unavailable
          </span>
          <img
            alt=""
            className="relative h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] group-focus-within:scale-[1.02]"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
            src={buildStoryThumbnailUrl(story.id)}
          />
        </div>
        <article className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
          <h2 className="m-0 wrap-break-word text-lg font-bold leading-snug text-app-foreground">
            {story.title}
          </h2>
          <dl className="mt-auto grid gap-2 border-t border-(--ds-color-border) pt-3 text-sm text-app-muted">
            <div className="flex min-w-0 items-baseline gap-2">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-app-muted">By</dt>
              <dd className="m-0 min-w-0 truncate font-medium text-app-foreground">
                {story.by ?? 'Unknown author'}
              </dd>
            </div>
            <div className="flex min-w-0 items-baseline gap-2">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-app-muted">
                Date
              </dt>
              <dd className="m-0 min-w-0 truncate">{formatUnixSecondsDate(story.time)}</dd>
            </div>
          </dl>
        </article>
      </Link>
    </Surface>
  )
}

export default StoryCard
