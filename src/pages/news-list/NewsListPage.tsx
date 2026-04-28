import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedStoriesQueryOptions } from '../../features/hacker-news/api/queries.ts';
import FeedTabs from '../../features/hacker-news/ui/FeedTabs.tsx';
import StoryGrid from '../../features/hacker-news/ui/StoryGrid.tsx';
import StoryGridSkeleton from '../../features/hacker-news/ui/StoryGridSkeleton.tsx';
import type { FeedType } from '../../features/hacker-news/model/types.ts';
import { Button } from '../../shared/ui/Button.tsx';
import { ErrorState } from '../../shared/ui/ErrorState.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Surface } from '../../shared/ui/Surface.tsx';

const feedHeadings: Record<FeedType, string> = {
  top: 'Top Stories',
  new: 'New Stories',
  best: 'Best Stories',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Story feed could not be loaded.';
}

function NewsListPage() {
  const [selectedFeed, setSelectedFeed] = useState<FeedType>('top');
  const feedStoriesQuery = useQuery(feedStoriesQueryOptions(selectedFeed));

  return (
    <PageShell
      actions={
        <FeedTabs onSelectFeed={setSelectedFeed} selectedFeed={selectedFeed} />
      }
      descriptionClassName="hidden lg:block"
      eyebrowClassName="hidden lg:block"
      title="AIPIA News"
    >
      <Surface
        className="border-0 bg-transparent shadow-none lg:overflow-hidden lg:border lg:border-(--ds-color-border) lg:bg-(--ds-color-surface) lg:shadow-(--ds-shadow-card)"
        elevated
      >
        <div className="hidden flex-col gap-2 border-b border-(--ds-color-border) bg-(--ds-color-surface) p-4 lg:flex lg:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-xl font-bold text-app-foreground">
              {feedHeadings[selectedFeed]}
            </h2>
          </div>
        </div>

        <div className="p-0 lg:p-6">
          {feedStoriesQuery.isLoading ? (
            <StoryGridSkeleton />
          ) : null}

          {feedStoriesQuery.isError ? (
            <ErrorState
              action={
                <Button
                  onClick={() => void feedStoriesQuery.refetch()}
                  variant="secondary"
                >
                  Try again
                </Button>
              }
              message={getErrorMessage(feedStoriesQuery.error)}
              title="Could not load stories"
            />
          ) : null}

          {feedStoriesQuery.isSuccess ? (
            <StoryGrid stories={feedStoriesQuery.data} />
          ) : null}
        </div>
      </Surface>
    </PageShell>
  );
}

export default NewsListPage;
