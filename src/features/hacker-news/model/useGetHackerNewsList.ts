import { useCallback, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { feedStoriesInfiniteQueryOptions } from '../api/queries.ts';
import type { FeedType } from './types.ts';

export function useGetHackerNewsList(feedType: FeedType) {
  const query = useInfiniteQuery(feedStoriesInfiniteQueryOptions(feedType));
  const {
    fetchNextPage: queryFetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = query;
  const fetchNextPageInFlightRef = useRef(false);
  const stories = useMemo(
    () => query.data?.pages.flatMap((page) => page.stories) ?? [],
    [query.data],
  );
  const paginationKey = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const lastPage = pages.at(-1);
    const nextCursor = lastPage?.nextPageParam?.cursor ?? 'end';

    return `${feedType}:${pages.length}:${nextCursor}`;
  }, [feedType, query.data]);
  const fetchNextPage = useCallback(async () => {
    if (
      fetchNextPageInFlightRef.current ||
      isFetchingNextPage ||
      !hasNextPage
    ) {
      return;
    }

    fetchNextPageInFlightRef.current = true;

    try {
      await queryFetchNextPage({ cancelRefetch: false });
    } finally {
      fetchNextPageInFlightRef.current = false;
    }
  }, [hasNextPage, isFetchingNextPage, queryFetchNextPage]);

  return {
    ...query,
    fetchNextPage,
    paginationKey,
    stories,
  };
}
