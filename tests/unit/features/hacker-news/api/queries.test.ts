import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import {
  feedStoriesQueryOptions,
  hackerNewsQueryKeys,
  storyDetailQueryOptions,
} from '@/features/hacker-news/api/queries.ts';
import {
  fetchStories,
  fetchStory,
} from '@/features/hacker-news/api/hackerNewsApi.ts';
import { INITIAL_STORY_LIMIT } from '@/features/hacker-news/model/constants.ts';
import { makeStory } from '../../../../utils/stories.ts';

vi.mock('@/features/hacker-news/api/hackerNewsApi.ts', () => ({
  fetchStories: vi.fn(),
  fetchStory: vi.fn(),
}));

describe('해커 뉴스 쿼리 키', () => {
  it('안정적인 계층형 쿼리 키를 만든다', () => {
    expect(hackerNewsQueryKeys.all).toEqual(['hacker-news']);
    expect(hackerNewsQueryKeys.feeds()).toEqual(['hacker-news', 'feed']);
    expect(hackerNewsQueryKeys.feed('top')).toEqual([
      'hacker-news',
      'feed',
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

describe('피드 스토리 쿼리 옵션', () => {
  it('선택한 피드를 조회하고 스토리 상세 캐시를 미리 채운다', async () => {
    const stories = [
      makeStory({ id: 1 }),
      makeStory({ id: 2, title: 'Second' }),
    ];
    vi.mocked(fetchStories).mockResolvedValueOnce(stories);
    const queryClient = new QueryClient();
    const signal = new AbortController().signal;
    const options = feedStoriesQueryOptions('best');

    await expect(
      options.queryFn?.({ client: queryClient, signal } as Parameters<
        NonNullable<typeof options.queryFn>
      >[0]),
    ).resolves.toEqual(stories);

    expect(options.queryKey).toEqual(hackerNewsQueryKeys.feed('best'));
    expect(fetchStories).toHaveBeenCalledWith('best', INITIAL_STORY_LIMIT, {
      signal,
    });
    expect(queryClient.getQueryData(hackerNewsQueryKeys.story(1))).toEqual(
      stories[0],
    );
    expect(queryClient.getQueryData(hackerNewsQueryKeys.story(2))).toEqual(
      stories[1],
    );
  });
});

describe('스토리 상세 쿼리 옵션', () => {
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
