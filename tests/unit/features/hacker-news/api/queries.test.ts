import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  feedStoriesInfiniteQueryOptions,
  fetchFeedStoryPage,
  hackerNewsQueryKeys,
  storyDetailQueryOptions,
} from '@/features/hacker-news/api/queries.ts';
import {
  fetchStoryIds,
  fetchStory,
} from '@/features/hacker-news/api/hackerNewsApi.ts';
import {
  STORY_ITEM_FETCH_CONCURRENCY,
  STORY_PAGE_SCAN_LIMIT,
} from '@/features/hacker-news/model/constants.ts';
import { makeStory } from '../../../../utils/stories.ts';

vi.mock('@/features/hacker-news/api/hackerNewsApi.ts', () => ({
  fetchStoryIds: vi.fn(),
  fetchStory: vi.fn(),
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 60 * 1000,
      },
    },
  });
}

describe('해커 뉴스 쿼리 키', () => {
  it('안정적인 계층형 쿼리 키를 만든다', () => {
    expect(hackerNewsQueryKeys.all).toEqual(['hacker-news']);
    expect(hackerNewsQueryKeys.feeds()).toEqual(['hacker-news', 'feed']);
    expect(hackerNewsQueryKeys.feed('top')).toEqual([
      'hacker-news',
      'feed',
      'top',
    ]);
    expect(hackerNewsQueryKeys.feedIds('top')).toEqual([
      'hacker-news',
      'feed-ids',
      'top',
    ]);
    expect(hackerNewsQueryKeys.stories()).toEqual(['hacker-news', 'story']);
    expect(hackerNewsQueryKeys.story(123)).toEqual([
      'hacker-news',
      'story',
      123,
    ]);
  });
});

describe('피드 스토리 인피니트 쿼리 옵션', () => {
  beforeEach(() => {
    vi.mocked(fetchStoryIds).mockReset();
    vi.mocked(fetchStory).mockReset();
  });

  it('선택한 피드를 커서 기반 인피니트 쿼리로 설정한다', () => {
    const nextPageParam = { cursor: 30, storyIds: [1, 2, 3] };
    const options = feedStoriesInfiniteQueryOptions('best');

    expect(options.queryKey).toEqual(hackerNewsQueryKeys.feed('best'));
    expect(options.initialPageParam).toEqual({ cursor: 0, storyIds: null });
    expect(
      options.getNextPageParam?.(
        { stories: [], nextPageParam },
        [],
        { cursor: 0, storyIds: null },
        [],
      ),
    ).toBe(nextPageParam);
    expect(
      options.getNextPageParam?.(
        { stories: [], nextPageParam: null },
        [],
        { cursor: 0, storyIds: null },
        [],
      ),
    ).toBeNull();
  });

  it('표시 가능한 스토리 9개를 확보하면 선 렌더용 첫 페이지와 고정된 다음 page param을 반환한다', async () => {
    const queryClient = makeQueryClient();
    const ids = Array.from({ length: 15 }, (_, index) => index + 1);
    vi.mocked(fetchStoryIds).mockResolvedValueOnce(ids);
    vi.mocked(fetchStory).mockImplementation(async (id) => {
      if ([2, 5, 10].includes(id)) {
        return null;
      }

      return makeStory({ id });
    });

    await expect(
      fetchFeedStoryPage({
        client: queryClient,
        feedType: 'top',
        pageParam: { cursor: 0, storyIds: null },
      }),
    ).resolves.toEqual({
      nextPageParam: { cursor: 12, storyIds: ids },
      stories: [1, 3, 4, 6, 7, 8, 9, 11, 12].map((id) => makeStory({ id })),
    });
    expect(fetchStoryIds).toHaveBeenCalledWith('top', { signal: undefined });
    expect(fetchStory).toHaveBeenCalledTimes(12);
    expect(queryClient.getQueryData(hackerNewsQueryKeys.story(1))).toEqual(
      makeStory({ id: 1 }),
    );
  });

  it('다음 페이지는 첫 페이지의 feed id snapshot을 재사용해 cursor 중복과 누락을 막는다', async () => {
    const queryClient = makeQueryClient();
    const initialIds = Array.from({ length: 12 }, (_, index) => index + 1);
    vi.mocked(fetchStoryIds).mockResolvedValueOnce(initialIds);
    vi.mocked(fetchStory).mockImplementation(async (id) => makeStory({ id }));

    const firstPage = await fetchFeedStoryPage({
      client: queryClient,
      feedType: 'new',
      pageParam: { cursor: 0, storyIds: null },
    });
    vi.mocked(fetchStoryIds).mockResolvedValueOnce([99, 98, 97]);
    expect(firstPage.nextPageParam?.storyIds).not.toBe(initialIds);
    initialIds.unshift(99);

    const secondPage = await fetchFeedStoryPage({
      client: queryClient,
      feedType: 'new',
      pageParam: firstPage.nextPageParam!,
    });

    expect(fetchStoryIds).toHaveBeenCalledTimes(1);
    expect(secondPage).toEqual({
      nextPageParam: null,
      stories: [10, 11, 12].map((id) => makeStory({ id })),
    });
    expect(fetchStory).not.toHaveBeenCalledWith(99, expect.anything());
  });

  it('이미 캐시된 스토리는 피드 페이지 조회 시 다시 item 요청하지 않는다', async () => {
    const cachedStory = makeStory({ id: 1, title: 'Cached' });
    const freshStory = makeStory({ id: 2, title: 'Fresh' });
    const queryClient = makeQueryClient();
    queryClient.setQueryData(hackerNewsQueryKeys.story(1), cachedStory);
    vi.mocked(fetchStoryIds).mockResolvedValueOnce([1, 2]);
    vi.mocked(fetchStory).mockResolvedValueOnce(freshStory);

    await expect(
      fetchFeedStoryPage({
        client: queryClient,
        feedType: 'top',
        pageParam: { cursor: 0, storyIds: null },
      }),
    ).resolves.toEqual({ nextPageParam: null, stories: [cachedStory, freshStory] });

    expect(fetchStory).toHaveBeenCalledTimes(1);
    expect(fetchStory).toHaveBeenCalledWith(2, { signal: undefined });
  });

  it('표시 가능한 스토리가 부족하면 scan limit까지만 훑고 다음 page param을 반환한다', async () => {
    const queryClient = makeQueryClient();
    const ids = Array.from(
      { length: STORY_PAGE_SCAN_LIMIT + 5 },
      (_, index) => index + 1,
    );
    vi.mocked(fetchStoryIds).mockResolvedValueOnce(ids);
    vi.mocked(fetchStory).mockImplementation(async (id) =>
      id === 1 ? makeStory({ id }) : null,
    );

    await expect(
      fetchFeedStoryPage({
        client: queryClient,
        feedType: 'new',
        pageParam: { cursor: 0, storyIds: null },
      }),
    ).resolves.toEqual({
      nextPageParam: { cursor: STORY_PAGE_SCAN_LIMIT, storyIds: ids },
      stories: [makeStory({ id: 1 })],
    });
    expect(fetchStory).toHaveBeenCalledTimes(STORY_PAGE_SCAN_LIMIT);
  });

  it('item 상세 조회는 설정된 최대 동시 요청 수를 넘지 않는다', async () => {
    const queryClient = makeQueryClient();
    const ids = Array.from({ length: 9 }, (_, index) => index + 1);
    let inFlightCount = 0;
    let maxInFlightCount = 0;
    vi.mocked(fetchStoryIds).mockResolvedValueOnce(ids);
    vi.mocked(fetchStory).mockImplementation(async (id) => {
      inFlightCount += 1;
      maxInFlightCount = Math.max(maxInFlightCount, inFlightCount);
      await Promise.resolve();
      inFlightCount -= 1;

      return makeStory({ id });
    });

    await fetchFeedStoryPage({
      client: queryClient,
      feedType: 'best',
      pageParam: { cursor: 0, storyIds: null },
    });

    expect(maxInFlightCount).toBeLessThanOrEqual(STORY_ITEM_FETCH_CONCURRENCY);
  });

  it('커서가 feed 끝에 도달하면 다음 페이지가 없음을 반환한다', async () => {
    const queryClient = makeQueryClient();
    vi.mocked(fetchStoryIds).mockResolvedValueOnce([1, 2, 3]);
    vi.mocked(fetchStory).mockImplementation(async (id) => makeStory({ id }));

    await expect(
      fetchFeedStoryPage({
        client: queryClient,
        feedType: 'best',
        pageParam: { cursor: 0, storyIds: null },
      }),
    ).resolves.toEqual({
      nextPageParam: null,
      stories: [1, 2, 3].map((id) => makeStory({ id })),
    });
  });
});

describe('스토리 상세 쿼리 옵션', () => {
  beforeEach(() => {
    vi.mocked(fetchStoryIds).mockReset();
    vi.mocked(fetchStory).mockReset();
  });

  it('스토리 식별자별 캐시 키로 단일 스토리를 조회한다', async () => {
    const story = makeStory({ id: 777 });
    vi.mocked(fetchStory).mockResolvedValueOnce(story);
    const signal = new AbortController().signal;
    const options = storyDetailQueryOptions(777);

    await expect(
      options.queryFn?.({ signal } as Parameters<
        NonNullable<typeof options.queryFn>
      >[0]),
    ).resolves.toEqual(story);

    expect(options.queryKey).toEqual(hackerNewsQueryKeys.story(777));
    expect(fetchStory).toHaveBeenCalledWith(777, { signal });
  });
});
