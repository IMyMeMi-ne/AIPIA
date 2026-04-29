import { formatUnixSecondsDate } from '@/shared/lib/date.ts'
import { getExternalUrl, NO_SOURCE_URL_LABEL } from '@/shared/lib/url.ts'
import { Surface } from '@/shared/ui/Surface.tsx'
import type { HackerNewsStory } from '../model/types.ts'

type StoryDetailPanelProps = {
  story: HackerNewsStory
}

const UNKNOWN_AUTHOR_LABEL = 'Unknown author'
const UNKNOWN_SCORE_LABEL = 'Score unavailable'
const detailItemClassName =
  'min-w-0 rounded-[var(--ds-radius-card)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface-muted)] p-4'
const sourceActionClassName =
  'inline-flex min-h-10 w-full items-center justify-center rounded-(--ds-radius-control) bg-app-foreground px-4 text-sm font-semibold text-app-background transition-colors hover:bg-app-muted sm:w-auto'
const unavailableSourceClassName =
  'inline-flex min-h-10 w-full items-center justify-center rounded-(--ds-radius-control) border border-dashed border-(--ds-color-border) bg-(--ds-color-surface-muted) px-4 text-sm font-semibold text-app-muted sm:w-auto'

function formatScore(score: HackerNewsStory['score']) {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return UNKNOWN_SCORE_LABEL
  }

  return `${score.toLocaleString('en')} ${score === 1 ? 'point' : 'points'}`
}

function getAuthorLabel(author: HackerNewsStory['by']) {
  return typeof author === 'string' && author.trim().length > 0
    ? author
    : UNKNOWN_AUTHOR_LABEL
}

function StoryDetailPanel({ story }: StoryDetailPanelProps) {
  const sourceUrl = getExternalUrl(story.url)
  const hasSourceUrl = sourceUrl !== undefined
  const displayUrl = sourceUrl ?? NO_SOURCE_URL_LABEL

  return (
    <Surface className="overflow-hidden" elevated>
      <article className="flex flex-col gap-6 p-5 sm:gap-7 sm:p-6">
        <div className="max-w-(--ds-layout-readable-max) space-y-3">
          <p className="m-0 text-sm font-semibold text-app-muted">Story #{story.id}</p>
          <h2 className="m-0 wrap-break-word text-2xl font-bold leading-tight text-app-foreground sm:text-3xl">
            {story.title}
          </h2>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3 sm:gap-4">
          <div className={detailItemClassName}>
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-app-muted">Author</dt>
            <dd className="m-0 wrap-break-word text-base font-bold text-app-foreground">
              {getAuthorLabel(story.by)}
            </dd>
          </div>
          <div className={detailItemClassName}>
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-app-muted">Score</dt>
            <dd className="m-0 text-base font-bold text-app-foreground">{formatScore(story.score)}</dd>
          </div>
          <div className={detailItemClassName}>
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-app-muted">
              Published
            </dt>
            <dd className="m-0 text-base font-bold text-app-foreground">
              {formatUnixSecondsDate(story.time)}
            </dd>
          </div>
        </dl>

        <section
          aria-labelledby="story-source-heading"
          className="min-w-0 rounded-(--ds-radius-card) border border-(--ds-color-border) p-4 sm:p-5"
        >
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3
                className="m-0 text-xs font-semibold uppercase tracking-wide text-app-muted"
                id="story-source-heading"
              >
                Source URL
              </h3>
              <p className="m-0 mt-1 min-w-0 break-all text-sm font-semibold text-app-foreground">
                {displayUrl}
              </p>
            </div>
            <div className="shrink-0">
              {hasSourceUrl ? (
                <a
                  className={sourceActionClassName}
                  href={sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={sourceUrl}
                >
                  Open original story
                </a>
              ) : (
                <span className={unavailableSourceClassName}>
                  {NO_SOURCE_URL_LABEL}
                </span>
              )}
            </div>
          </div>
        </section>
      </article>
    </Surface>
  )
}

export default StoryDetailPanel
