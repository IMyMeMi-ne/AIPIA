import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/shared/ui/Button.tsx';
import { EmptyState } from '@/shared/ui/EmptyState.tsx';
import type { HackerNewsStory } from '../model/types.ts';
import {
  FIRST_STORY_INDEX,
  MOBILE_COLUMN_COUNT,
  STORY_GRID_CARD_MIN_WIDTH_PX,
  STORY_GRID_GAP_PX,
  STORY_GRID_DESKTOP_BREAKPOINT_PX,
} from './storyGridConstants.ts';
import {
  chunkItems,
  getEstimatedRowHeight,
  getInitialIsDesktop,
  getInitialListWidth,
  getStoryGridAutoLoadKey,
  getStoryGridColumnCount,
  getViewportBounds,
  getVirtualContentHeight,
  getVirtualRowOverscan,
  isLoaderRowVisible,
  type ListMetrics,
} from './storyGridLayout.ts';
import StoryCard from './StoryCard.tsx';

type StoryGridStyle = CSSProperties & {
  '--story-grid-card-min-width': string;
  '--story-grid-column-count': number;
  '--story-grid-gap': string;
};

type StoryGridProps = {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  loadMoreError?: string;
  onLoadMore?: () => void;
  paginationKey?: string;
  stories: HackerNewsStory[];
};

function StoryGrid({
  hasNextPage = false,
  isFetchingNextPage = false,
  loadMoreError,
  onLoadMore,
  paginationKey = 'initial',
  stories,
}: StoryGridProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const autoLoadKeyRef = useRef<string | null>(null);
  const [listMetrics, setListMetrics] = useState<ListMetrics>({
    isDesktop: getInitialIsDesktop(),
    scrollMargin: 0,
    width: getInitialListWidth(),
  });

  const measureList = useCallback(() => {
    const element = listRef.current;

    if (element === null) {
      return;
    }

    const rect = element.getBoundingClientRect();

    setListMetrics({
      isDesktop: window.innerWidth >= STORY_GRID_DESKTOP_BREAKPOINT_PX,
      scrollMargin: rect.top + window.scrollY,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    const element = listRef.current;

    if (element === null) {
      return undefined;
    }

    measureList();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(measureList);
      resizeObserver.observe(element);

      return () => resizeObserver.disconnect();
    }

    window.addEventListener('resize', measureList);

    return () => window.removeEventListener('resize', measureList);
  }, [measureList]);

  useLayoutEffect(() => {
    measureList();
  }, [measureList, stories.length]);

  const columnCount = getStoryGridColumnCount(
    listMetrics.width,
    listMetrics.isDesktop,
  );
  const storyRows = useMemo(
    () => chunkItems(stories, columnCount),
    [columnCount, stories],
  );
  const loaderRowIndex = storyRows.length;
  const rowCount = storyRows.length + (hasNextPage ? 1 : 0);
  const getItemKey = useCallback(
    (index: number) => {
      if (index === loaderRowIndex) {
        return 'load-more';
      }

      return storyRows[index]?.map((story) => story.id).join('-') ?? index;
    },
    [loaderRowIndex, storyRows],
  );
  const rowVirtualizer = useWindowVirtualizer<HTMLDivElement>({
    count: rowCount,
    estimateSize: () => getEstimatedRowHeight(columnCount),
    gap: columnCount === MOBILE_COLUMN_COUNT ? 0 : STORY_GRID_GAP_PX,
    getItemKey,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: getVirtualRowOverscan(columnCount),
    scrollMargin: listMetrics.scrollMargin,
  });

  useLayoutEffect(() => {
    rowVirtualizer.measure();
  }, [columnCount, rowCount, rowVirtualizer]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualContentHeight = getVirtualContentHeight(
    virtualRows,
    rowVirtualizer.getTotalSize(),
    rowVirtualizer.options.scrollMargin,
  );
  const viewportBounds = getViewportBounds({
    measuredViewportHeight: rowVirtualizer.scrollRect?.height,
    scrollOffset: rowVirtualizer.scrollOffset,
  });
  const loaderRowIsVisible = isLoaderRowVisible({
    hasNextPage,
    loaderRowIndex,
    viewportEnd: viewportBounds.end,
    viewportStart: viewportBounds.start,
    virtualRows,
  });
  const autoLoadKey = getStoryGridAutoLoadKey(
    paginationKey,
    loaderRowIndex,
    stories,
  );
  const gridStyle: StoryGridStyle = {
    '--story-grid-card-min-width': `${STORY_GRID_CARD_MIN_WIDTH_PX}px`,
    '--story-grid-column-count': columnCount,
    '--story-grid-gap': `${STORY_GRID_GAP_PX}px`,
  };

  useEffect(() => {
    if (!loaderRowIsVisible || loadMoreError !== undefined) {
      autoLoadKeyRef.current = null;
      return;
    }

    if (
      !isFetchingNextPage &&
      autoLoadKeyRef.current !== autoLoadKey
    ) {
      autoLoadKeyRef.current = autoLoadKey;
      onLoadMore?.();
    }
  }, [
    autoLoadKey,
    isFetchingNextPage,
    loaderRowIsVisible,
    loadMoreError,
    onLoadMore,
  ]);

  if (stories.length === 0 && !hasNextPage) {
    return (
      <EmptyState
        message="There are no stories available for this feed right now."
        title="No stories found"
      />
    );
  }

  return (
    <div
      ref={listRef}
      className="border-y border-(--ds-color-border) lg:border-y-0"
      style={gridStyle}
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualContentHeight}px` }}
      >
        {virtualRows.map((virtualRow) => {
          const rowStories = storyRows[virtualRow.index];
          const rowStyle: CSSProperties = {
            left: 0,
            position: 'absolute',
            top: 0,
            transform: `translateY(${
              virtualRow.start - rowVirtualizer.options.scrollMargin
            }px)`,
            width: '100%',
          };

          if (rowStories === undefined) {
            return (
              <div
                key={virtualRow.key}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                className="flex flex-col items-center justify-center gap-3 py-6 text-center"
                style={rowStyle}
              >
                {loadMoreError !== undefined ? (
                  <p
                    className="m-0 max-w-(--ds-layout-readable-max) text-sm text-(--ds-color-danger)"
                    role="alert"
                  >
                    {loadMoreError}
                  </p>
                ) : null}
                <Button
                  disabled={isFetchingNextPage}
                  onClick={() => onLoadMore?.()}
                  variant="secondary"
                >
                  {isFetchingNextPage
                    ? 'Loading more stories...'
                    : loadMoreError === undefined
                      ? 'Load more stories'
                      : 'Try loading more stories again'}
                </Button>
              </div>
            );
          }

          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="grid gap-0 border-b border-(--ds-color-border) last:border-b-0 lg:grid-cols-[repeat(var(--story-grid-column-count),minmax(min(100%,var(--story-grid-card-min-width)),1fr))] lg:gap-(--story-grid-gap) lg:border-b-0"
              style={rowStyle}
            >
              {rowStories.map((story, rowStoryIndex) => {
                const storyIndex =
                  virtualRow.index * columnCount + rowStoryIndex;

                return (
                  <StoryCard
                    key={story.id}
                    priority={storyIndex === FIRST_STORY_INDEX}
                    story={story}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StoryGrid;
