import { Link } from 'react-router-dom';
import { formatUnixSecondsDate } from '@/shared/lib/date.ts';
import { Surface } from '@/shared/ui/Surface.tsx';
import { buildStoryThumbnailUrl } from '../lib/story.ts';
import type { HackerNewsStory } from '../model/types.ts';

type StoryCardVariant = 'compact' | 'desktop' | 'featured';

type StoryCardProps = {
  story: HackerNewsStory;
  variant?: StoryCardVariant;
};

function StoryMeta({ story }: { story: HackerNewsStory }) {
  const dateLabel = formatUnixSecondsDate(story.time);
  const dateTime =
    typeof story.time === 'number'
      ? new Date(story.time * 1000).toISOString()
      : undefined;

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

function FeaturedStoryCard({ story }: { story: HackerNewsStory }) {
  return (
    <Surface className="group overflow-hidden border-(--ds-color-border) bg-(--ds-color-surface) shadow-[0_18px_50px_rgb(21_23_26/0.10)]">
      <Link
        aria-label={`Read story: ${story.title}`}
        className="block rounded-[inherit]"
        to={`/stories/${story.id}`}
      >
        <div className="relative aspect-[1.18] overflow-hidden bg-(--ds-color-surface-muted)">
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center px-4 text-center text-xs font-semibold text-app-muted"
          >
            Image
          </span>
          <img
            alt=""
            className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] group-focus-within:scale-[1.025]"
            loading="eager"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            src={buildStoryThumbnailUrl(story.id)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent p-4 pt-16 text-white">
            <div className="mb-2 flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/80">
              <span className="h-px w-7 bg-(--ds-color-accent)" />
              <span>Lead story</span>
            </div>
            <h2 className="m-0 line-clamp-3 text-2xl font-black leading-[1.05] tracking-[-0.035em]">
              {story.title}
            </h2>
          </div>
        </div>
        <article className="p-4">
          <StoryMeta story={story} />
        </article>
      </Link>
    </Surface>
  );
}

function CompactStoryCard({ story }: { story: HackerNewsStory }) {
  return (
    <Link
      aria-label={`Read story: ${story.title}`}
      className="group grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)] gap-3 py-4"
      to={`/stories/${story.id}`}
    >
      <div className="relative h-20">
        <div className="h-full overflow-hidden rounded-(--ds-radius-sm) bg-(--ds-color-surface-muted)">
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center px-2 text-center text-[0.625rem] font-semibold text-app-muted"
          >
            Image
          </span>
          <img
            alt=""
            className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            src={buildStoryThumbnailUrl(story.id)}
          />
        </div>
      </div>
      <article className="flex h-full min-w-0 flex-col border-l-2 border-transparent pl-3 transition-colors group-hover:border-(--ds-color-accent) group-focus-visible:border-(--ds-color-accent)">
        <h2 className="m-0 line-clamp-2 text-[1.0625rem] font-bold leading-snug tracking-[-0.015em] text-app-foreground transition-colors group-hover:text-(--ds-color-accent-hover) group-focus-visible:text-(--ds-color-accent-hover)">
          {story.title}
        </h2>
        <div className="mt-auto pt-2">
          <StoryMeta story={story} />
        </div>
      </article>
    </Link>
  );
}

function DesktopStoryCard({ story }: { story: HackerNewsStory }) {
  return (
    <Surface className="group h-full overflow-hidden border border-(--ds-color-border) bg-(--ds-color-surface) transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-(--ds-shadow-card) focus-within:-translate-y-0.5 focus-within:shadow-(--ds-shadow-card)">
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
              event.currentTarget.style.display = 'none';
            }}
            src={buildStoryThumbnailUrl(story.id)}
          />
        </div>
        <article className="flex flex-1 flex-col gap-4 p-5">
          <h2 className="m-0 text-lg font-bold leading-snug text-app-foreground">
            {story.title}
          </h2>
          <dl className="mt-auto grid gap-2 border-t border-(--ds-color-border) pt-3 text-sm text-app-muted">
            <div className="flex min-w-0 items-baseline gap-2">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-app-muted">
                By
              </dt>
              <dd className="m-0 min-w-0 truncate font-medium text-app-foreground">
                {story.by ?? 'Unknown author'}
              </dd>
            </div>
            <div className="flex min-w-0 items-baseline gap-2">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-app-muted">
                Date
              </dt>
              <dd className="m-0 min-w-0 truncate">
                {formatUnixSecondsDate(story.time)}
              </dd>
            </div>
          </dl>
        </article>
      </Link>
    </Surface>
  );
}

function StoryCard({ story, variant = 'desktop' }: StoryCardProps) {
  if (variant === 'featured') {
    return <FeaturedStoryCard story={story} />;
  }

  if (variant === 'compact') {
    return <CompactStoryCard story={story} />;
  }

  return <DesktopStoryCard story={story} />;
}

export default StoryCard;
