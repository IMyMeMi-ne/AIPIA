import { useCallback, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { feedStoriesInfiniteQueryOptions } from '../api/queries.ts';
import type { FeedType } from './types.ts';

export function useGetHackerNewsList(feedType: FeedType) {
  const query = useInfiniteQuery(feedStoriesInfiniteQueryOptions(feedType));
  const fetchNextPageInFlightRef = useRef(false);
  const stories = useMemo(
    () => query.data?.pages.flatMap((page) => page.stories) ?? [],
    [query.data],
  );
  const fetchNextPage = useCallback(async () => {
    if (
      fetchNextPageInFlightRef.current ||
      query.isFetchingNextPage ||
      !query.hasNextPage
    ) {
      return;
    }

    fetchNextPageInFlightRef.current = true;

    try {
      await query.fetchNextPage({ cancelRefetch: false });
    } finally {
      fetchNextPageInFlightRef.current = false;
    }
  }, [query]);

  return {
    ...query,
    fetchNextPage,
    stories,
  };
}
