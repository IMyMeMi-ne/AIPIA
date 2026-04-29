import {
  infiniteQueryOptions,
  queryOptions,
  type QueryClient,
} from '@tanstack/react-query';
import {
  STORY_ITEM_FETCH_CONCURRENCY,
  STORY_PAGE_SCAN_LIMIT,
  STORY_PAGE_SIZE,
} from '../model/constants.ts';
import type {
  FeedType,
  HackerNewsItem,
  HackerNewsStory,
} from '../model/types.ts';
import { fetchStoryIds, fetchStory } from './hackerNewsApi.ts';

// infinite query의 pageParam: cursor는 고정된 feed id snapshot 안의 index
// storyIds가 null이면 첫 page라서 feed id 목록을 새로 조회하고, 이후 page는 같은 snapshot을 재사용
export type FeedStoriesPageParam = {
  cursor: number;
  storyIds: readonly HackerNewsItem['id'][] | null;
};

// 한 page는 화면에 추가할 story 목록과 다음 page를 가져오기 위한 pageParam을 함께 반환
export type FeedStoriesPage = {
  stories: HackerNewsStory[];
  nextPageParam: FeedStoriesPageParam | null;
};

// Hacker News 서버 상태 key factory. feed 목록, feed id snapshot, story detail cache를 분리
export const hackerNewsQueryKeys = {
  all: ['hacker-news'] as const,
  feeds: () => [...hackerNewsQueryKeys.all, 'feed'] as const,
  feed: (feedType: FeedType) =>
    [...hackerNewsQueryKeys.feeds(), feedType] as const,
  feedIds: (feedType: FeedType) =>
    [...hackerNewsQueryKeys.all, 'feed-ids', feedType] as const,
  stories: () => [...hackerNewsQueryKeys.all, 'story'] as const,
  story: (storyId: HackerNewsItem['id']) =>
    [...hackerNewsQueryKeys.stories(), storyId] as const,
};

// AbortError는 TanStack Query 취소 신호이므로 item 실패로 삼키지 않고 상위 query에 전파
function isAbortError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

type StoryFetchResult =
  | { status: 'story'; story: HackerNewsStory }
  | { status: 'unavailable' }
  | { status: 'failed'; error: unknown };

type FetchFeedStoryPageOptions = {
  client: QueryClient;
  feedType: FeedType;
  pageParam: FeedStoriesPageParam;
  signal?: AbortSignal;
};

// fresh detail cache가 있으면 재사용하고, unavailable item과 transport 실패를 구분
async function fetchStoryFromCache(
  client: QueryClient,
  storyId: HackerNewsItem['id'],
  signal?: AbortSignal,
): Promise<StoryFetchResult> {
  try {
    const story = await client.fetchQuery({
      queryKey: hackerNewsQueryKeys.story(storyId),
      queryFn: () => fetchStory(storyId, { signal }),
      // feed page 내부 item 실패는 건너뛰는 정책이므로 숨은 재시도 요청을 만들지 않음
      // 상세 화면의 story query는 별도 query option에서 전역 retry 정책을 그대로 따름
      retry: false,
    });

    return story === null
      ? { status: 'unavailable' }
      : { status: 'story', story };
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return { status: 'failed', error };
  }
}

// 첫 page에서는 feed id 목록을 조회한 뒤 복사본을 snapshot으로 고정
// 이후 page는 pageParam.storyIds를 그대로 사용해 feed가 stale/refetch되어도 cursor 의미가 바뀌지 않음
async function getFeedStoryIdsSnapshot(
  client: QueryClient,
  feedType: FeedType,
  pageParam: FeedStoriesPageParam,
  signal?: AbortSignal,
) {
  if (pageParam.storyIds !== null) {
    return pageParam.storyIds;
  }

  const fetchedStoryIds = await client.fetchQuery({
    queryKey: hackerNewsQueryKeys.feedIds(feedType),
    queryFn: () => fetchStoryIds(feedType, { signal }),
  });

  return [...fetchedStoryIds];
}

// cursor부터 scan limit 안에서 display 가능한 story를 page size만큼 모음
// deleted/dead/non-story item이 섞일 수 있어 "id N개"가 아니라 "displayable story N개"를 목표
export async function fetchFeedStoryPage({
  client,
  feedType,
  pageParam,
  signal,
}: FetchFeedStoryPageOptions): Promise<FeedStoriesPage> {
  const storyIds = await getFeedStoryIdsSnapshot(
    client,
    feedType,
    pageParam,
    signal,
  );
  const startCursor = Math.max(0, Math.floor(pageParam.cursor));
  const scanEndCursor = Math.min(
    storyIds.length,
    startCursor + STORY_PAGE_SCAN_LIMIT,
  );
  const stories: HackerNewsStory[] = [];
  const failedItemErrors: unknown[] = [];
  let nextCursor = startCursor;

  while (nextCursor < scanEndCursor && stories.length < STORY_PAGE_SIZE) {
    const batchStartCursor = nextCursor;
    const remainingStorySlots = STORY_PAGE_SIZE - stories.length;
    const batchEndCursor = Math.min(
      batchStartCursor + remainingStorySlots,
      batchStartCursor + STORY_ITEM_FETCH_CONCURRENCY,
      scanEndCursor,
    );
    const batchStoryIds = storyIds.slice(batchStartCursor, batchEndCursor);

    // 한 번에 너무 많은 item 요청을 만들지 않도록 concurrency 크기만큼 batch 조회
    const batchStoryResults = await Promise.all(
      batchStoryIds.map((storyId) =>
        fetchStoryFromCache(client, storyId, signal),
      ),
    );

    for (const [batchIndex, result] of batchStoryResults.entries()) {
      // batch 안에서 어디까지 소비했는지 cursor를 item 단위로 갱신
      // batch 크기는 남은 표시 슬롯 이하로 제한하지만, 방어적으로 page size 도달 시 중단
      nextCursor = batchStartCursor + batchIndex + 1;

      if (result.status === 'story') {
        stories.push(result.story);
      } else if (result.status === 'failed') {
        failedItemErrors.push(result.error);
      }

      if (stories.length >= STORY_PAGE_SIZE) {
        break;
      }
    }

    if (stories.length < STORY_PAGE_SIZE) {
      nextCursor = batchEndCursor;
    }
  }

  if (stories.length === 0 && failedItemErrors.length > 0) {
    throw new Error(
      `Hacker News item 상세 조회 ${failedItemErrors.length}건이 실패해 표시할 스토리를 불러오지 못했습니다.`,
      { cause: failedItemErrors[0] },
    );
  }

  return {
    stories,
    nextPageParam:
      nextCursor < storyIds.length ? { cursor: nextCursor, storyIds } : null,
  };
}

const initialFeedStoriesPageParam: FeedStoriesPageParam = {
  cursor: 0,
  storyIds: null,
};

export function feedStoriesInfiniteQueryOptions(feedType: FeedType) {
  return infiniteQueryOptions({
    queryKey: hackerNewsQueryKeys.feed(feedType),
    initialPageParam: initialFeedStoriesPageParam,
    queryFn: ({ signal, client, pageParam }) =>
      fetchFeedStoryPage({
        client,
        feedType,
        pageParam,
        signal,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
  });
}

export function storyDetailQueryOptions(storyId: HackerNewsItem['id']) {
  return queryOptions({
    queryKey: hackerNewsQueryKeys.story(storyId),
    queryFn: ({ signal }) => fetchStory(storyId, { signal }),
  });
}
