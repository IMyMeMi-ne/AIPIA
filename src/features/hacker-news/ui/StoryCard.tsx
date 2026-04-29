import { Link } from 'react-router-dom';
import {
  formatUnixSecondsDate,
  formatUnixSecondsDateTime,
} from '@/shared/lib/date.ts';
import { buildStoryThumbnailUrl } from '../lib/story.ts';
import type { HackerNewsStory } from '../model/types.ts';

type StoryCardProps = {
  priority?: boolean;
  story: HackerNewsStory;
};

function StoryMeta({ story }: { story: HackerNewsStory }) {
  const dateLabel = formatUnixSecondsDate(story.time);
  const dateTime = formatUnixSecondsDateTime(story.time);

  return (
    <p className="m-0 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-app-muted">
      <span className="min-w-0 truncate font-medium text-app-muted">
        {story.by ?? 'Unknown author'}
      </span>
      <span aria-hidden="true" className="text-(--ds-color-accent)">
        /
      </span>
      <time dateTime={dateTime}>{dateLabel}</time>
    </p>
  );
}

function StoryCard({ priority = false, story }: StoryCardProps) {
  return (
    <div className="group min-w-0 overflow-hidden lg:h-full lg:rounded-(--ds-radius-card) lg:border lg:border-(--ds-color-border) lg:bg-(--ds-color-surface) lg:shadow-sm lg:transition-[box-shadow,transform] lg:hover:-translate-y-0.5 lg:hover:shadow-(--ds-shadow-card) lg:focus-within:-translate-y-0.5 lg:focus-within:shadow-(--ds-shadow-card)">
      <Link
        aria-label={`Read story: ${story.title}`}
        className="grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)] gap-3 py-4 lg:flex lg:h-full lg:flex-col lg:gap-0 lg:py-0"
        to={`/stories/${story.id}`}
      >
        <div className="relative h-20 overflow-hidden rounded-(--ds-radius-sm) bg-(--ds-color-surface-muted) lg:aspect-3/2 lg:h-auto lg:rounded-none">
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center px-2 text-center text-[0.625rem] font-semibold text-app-muted lg:px-4 lg:text-xs"
          >
            Thumbnail unavailable
          </span>
          <img
            alt=""
            className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] group-focus-within:scale-[1.04] lg:duration-200 lg:group-hover:scale-[1.02] lg:group-focus-within:scale-[1.02]"
            fetchPriority={priority ? 'high' : 'auto'}
            loading={priority ? 'eager' : 'lazy'}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            src={buildStoryThumbnailUrl(story.id)}
          />
        </div>
        <article className="flex h-full min-w-0 flex-col border-l-2 border-transparent pl-3 transition-colors group-hover:border-(--ds-color-accent) group-focus-within:border-(--ds-color-accent) lg:flex-1 lg:gap-4 lg:border-l-0 lg:p-5">
          <h2 className="m-0 line-clamp-2 text-[1.0625rem] font-bold leading-snug tracking-[-0.015em] text-app-foreground transition-colors group-hover:text-(--ds-color-accent-hover) group-focus-within:text-(--ds-color-accent-hover) lg:line-clamp-none lg:text-lg lg:tracking-normal">
            {story.title}
          </h2>
          <div className="mt-auto pt-2">
            <StoryMeta story={story} />
          </div>
        </article>
      </Link>
    </div>
  );
}

export default StoryCard;
