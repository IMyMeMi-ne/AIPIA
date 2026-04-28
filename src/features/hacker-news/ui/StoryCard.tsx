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
    <Surface className="group overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-[var(--ds-shadow-card)]">
      <Link aria-label={`Read story: ${story.title}`} className="flex h-full flex-col" to={`/stories/${story.id}`}>
        <div className="aspect-[3/2] bg-[var(--ds-color-surface-muted)]">
          <img
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
            src={buildStoryThumbnailUrl(story.id)}
          />
        </div>
        <article className="flex flex-1 flex-col gap-3 p-4">
          <h2 className="m-0 text-lg font-bold leading-snug text-app-foreground break-words">
            {story.title}
          </h2>
          <dl className="mt-auto grid gap-1 text-sm text-app-muted">
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 font-semibold text-app-foreground">By</dt>
              <dd className="m-0 min-w-0 truncate">{story.by ?? 'Unknown author'}</dd>
            </div>
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 font-semibold text-app-foreground">Date</dt>
              <dd className="m-0 min-w-0 truncate">{formatUnixSecondsDate(story.time)}</dd>
            </div>
          </dl>
        </article>
      </Link>
    </Surface>
  )
}

export default StoryCard
