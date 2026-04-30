import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetHackerNewsList } from '@/features/hacker-news/model/useGetHackerNewsList.ts';
import FeedTabs from '@/features/hacker-news/ui/FeedTabs.tsx';
import StoryGrid from '@/features/hacker-news/ui/StoryGrid.tsx';
import StoryGridSkeleton from '@/features/hacker-news/ui/StoryGridSkeleton.tsx';
import { FEED_TYPES, type FeedType } from '@/features/hacker-news/model/types.ts';
import { Button } from '@/shared/ui/Button.tsx';
import { ErrorState } from '@/shared/ui/ErrorState.tsx';
import { PageShell } from '@/shared/ui/PageShell.tsx';
import { Surface } from '@/shared/ui/Surface.tsx';
import { ThemeToggle } from '@/shared/ui/ThemeToggle.tsx';

const feedHeadings: Record<FeedType, string> = {
  top: 'Top Stories',
  new: 'New Stories',
  best: 'Best Stories',
};

function isFeedType(feed: string | null): feed is FeedType {
  return FEED_TYPES.includes(feed as FeedType);
}

function getFeedFromSearchParams(searchParams: URLSearchParams) {
  const feed = searchParams.get('feed');

  return isFeedType(feed) ? feed : 'top';
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Story feed could not be loaded.';
}

function NewsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFeed = getFeedFromSearchParams(searchParams);
  const handleSelectFeed = useCallback(
    (feed: FeedType) => {
      const nextSearchParams = new URLSearchParams(searchParams);

      if (feed === 'top') {
        nextSearchParams.delete('feed');
      } else {
        nextSearchParams.set('feed', feed);
      }

      if (nextSearchParams.toString() === searchParams.toString()) {
        return;
      }

      setSearchParams(nextSearchParams);
    },
    [searchParams, setSearchParams],
  );
  const {
    error,
    fetchNextPage,
    hasNextPage,
    data,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    paginationKey,
    refetch,
    stories,
  } = useGetHackerNewsList(selectedFeed);
  const hasLoadedPages = (data?.pages.length ?? 0) > 0;
  const loadMoreErrorMessage = isFetchNextPageError
    ? getErrorMessage(error)
    : undefined;
  const showInitialError = isError && !hasLoadedPages;
  const showStoryGrid = isSuccess || hasLoadedPages;

  return (
    <PageShell
      actions={<FeedTabs onSelectFeed={handleSelectFeed} selectedFeed={selectedFeed} />}
      titleActions={<ThemeToggle />}
      descriptionClassName="hidden lg:block"
      eyebrowClassName="hidden lg:block"
      title="AIPIA News"
    >
      <Surface
        className="overflow-hidden border-0 bg-transparent shadow-none lg:border lg:border-(--ds-color-border) lg:bg-(--ds-color-surface) lg:shadow-(--ds-shadow-card)"
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
          {isLoading ? <StoryGridSkeleton /> : null}

          {showInitialError ? (
            <ErrorState
              action={
                <Button
                  onClick={() => void refetch()}
                  variant="secondary"
                >
                  Try again
                </Button>
              }
              message={getErrorMessage(error)}
              title="Could not load stories"
            />
          ) : null}

          {showStoryGrid ? (
            <StoryGrid
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreError={loadMoreErrorMessage}
              onLoadMore={() => void fetchNextPage()}
              paginationKey={paginationKey}
              stories={stories}
            />
          ) : null}
        </div>
      </Surface>
    </PageShell>
  );
}

export default NewsListPage;
