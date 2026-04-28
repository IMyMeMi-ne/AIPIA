import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { feedStoriesQueryOptions } from '../../features/hacker-news/api/queries.ts'
import FeedTabs from '../../features/hacker-news/ui/FeedTabs.tsx'
import StoryGrid from '../../features/hacker-news/ui/StoryGrid.tsx'
import type { FeedType } from '../../features/hacker-news/model/types.ts'
import { Badge } from '../../shared/ui/Badge.tsx'
import { Button } from '../../shared/ui/Button.tsx'
import { ErrorState } from '../../shared/ui/ErrorState.tsx'
import { LoadingState } from '../../shared/ui/LoadingState.tsx'
import { PageShell } from '../../shared/ui/PageShell.tsx'
import { Surface } from '../../shared/ui/Surface.tsx'

const feedHeadings: Record<FeedType, string> = {
  top: 'Top Stories',
  new: 'New Stories',
  best: 'Best Stories',
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Story feed could not be loaded.'
}

function NewsListPage() {
  const [selectedFeed, setSelectedFeed] = useState<FeedType>('top')
  const feedStoriesQuery = useQuery(feedStoriesQueryOptions(selectedFeed))

  return (
    <PageShell
      actions={<FeedTabs onSelectFeed={setSelectedFeed} selectedFeed={selectedFeed} />}
      description="Browse Hacker News stories by feed. Choose Top, New, or Best to refresh the board."
      eyebrow={<Badge variant="accent">Hacker News board</Badge>}
      title="AIPIA News"
    >
      <Surface className="p-4 sm:p-6" elevated>
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="m-0 text-xl font-bold text-app-foreground">{feedHeadings[selectedFeed]}</h2>
          <p className="m-0 text-sm text-app-muted">
            Showing displayable stories only. Some unavailable items may be skipped.
          </p>
        </div>

        {feedStoriesQuery.isLoading ? <LoadingState label="Loading stories..." /> : null}

        {feedStoriesQuery.isError ? (
          <ErrorState
            action={
              <Button onClick={() => void feedStoriesQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
            message={getErrorMessage(feedStoriesQuery.error)}
            title="Could not load stories"
          />
        ) : null}

        {feedStoriesQuery.isSuccess ? <StoryGrid stories={feedStoriesQuery.data} /> : null}
      </Surface>
    </PageShell>
  )
}

export default NewsListPage
