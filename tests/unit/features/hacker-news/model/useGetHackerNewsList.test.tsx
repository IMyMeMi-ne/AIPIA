import { renderHook } from '@testing-library/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { useGetHackerNewsList } from '@/features/hacker-news/model/useGetHackerNewsList.ts';
import { feedStoriesInfiniteQueryOptions } from '@/features/hacker-news/api/queries.ts';
import { infiniteQuerySuccess } from '../../../../utils/react-query.ts';
import { makeStory } from '../../../../utils/stories.ts';

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();

  return {
    ...actual,
    useInfiniteQuery: vi.fn(),
  };
});

vi.mock('@/features/hacker-news/api/queries.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/hacker-news/api/queries.ts')>();

  return {
    ...actual,
    feedStoriesInfiniteQueryOptions: vi.fn(actual.feedStoriesInfiniteQueryOptions),
  };
});

function storyPage(storyIds: number[]) {
  return {
    nextPageParam: null,
    stories: storyIds.map((id) => makeStory({ id })),
  };
}

function deferredPromise() {
  let resolve!: () => void;
  const promise = new Promise<void>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe('useGetHackerNewsList', () => {
  it('인피니트 쿼리 page 데이터를 UI용 story 배열로 평탄화한다', () => {
    vi.mocked(useInfiniteQuery).mockReturnValue(
      infiniteQuerySuccess([storyPage([1, 2]), storyPage([3])]),
    );

    const { result } = renderHook(() => useGetHackerNewsList('top'));

    expect(feedStoriesInfiniteQueryOptions).toHaveBeenCalledWith('top');
    expect(result.current.stories).toEqual([1, 2, 3].map((id) => makeStory({ id })));
  });

  it('이미 다음 페이지 요청이 진행 중이면 중복 fetchNextPage 호출을 막는다', async () => {
    const deferred = deferredPromise();
    const fetchNextPage = vi.fn(() => deferred.promise);
    vi.mocked(useInfiniteQuery).mockReturnValue(
      infiniteQuerySuccess([storyPage([1])], {
        fetchNextPage,
        hasNextPage: true,
      }),
    );
    const { result } = renderHook(() => useGetHackerNewsList('new'));

    const firstFetch = result.current.fetchNextPage();
    const secondFetch = result.current.fetchNextPage();
    deferred.resolve();
    await Promise.all([firstFetch, secondFetch]);

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(fetchNextPage).toHaveBeenCalledWith({ cancelRefetch: false });
  });

  it('query result object가 바뀌어도 필요한 의존성이 같으면 fetchNextPage callback을 유지한다', () => {
    const fetchNextPage = vi.fn();
    vi.mocked(useInfiniteQuery)
      .mockReturnValueOnce(
        infiniteQuerySuccess([storyPage([1])], {
          fetchNextPage,
          hasNextPage: true,
        }),
      )
      .mockReturnValueOnce(
        infiniteQuerySuccess([storyPage([1])], {
          fetchNextPage,
          hasNextPage: true,
        }),
      );

    const { rerender, result } = renderHook(() => useGetHackerNewsList('new'));
    const firstFetchNextPage = result.current.fetchNextPage;

    rerender();

    expect(result.current.fetchNextPage).toBe(firstFetchNextPage);
  });

  it('다음 페이지가 없거나 이미 fetching 상태면 추가 조회하지 않는다', async () => {
    const fetchNextPage = vi.fn();
    vi.mocked(useInfiniteQuery).mockReturnValue(
      infiniteQuerySuccess([storyPage([1])], {
        fetchNextPage,
        hasNextPage: false,
      }),
    );
    const noNextPage = renderHook(() => useGetHackerNewsList('best'));
    await noNextPage.result.current.fetchNextPage();

    vi.mocked(useInfiniteQuery).mockReturnValue(
      infiniteQuerySuccess([storyPage([1])], {
        fetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: true,
      }),
    );
    const alreadyFetching = renderHook(() => useGetHackerNewsList('best'));
    await alreadyFetching.result.current.fetchNextPage();

    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
