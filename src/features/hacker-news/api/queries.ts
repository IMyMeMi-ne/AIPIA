import { queryOptions } from '@tanstack/react-query'
import { INITIAL_STORY_LIMIT } from '../model/constants.ts'
import type { FeedType, HackerNewsItem } from '../model/types.ts'
import { fetchStories, fetchStory } from './hackerNewsApi.ts'

export const hackerNewsQueryKeys = {
  all: ['hacker-news'] as const,
  feeds: () => [...hackerNewsQueryKeys.all, 'feed'] as const,
  feed: (feedType: FeedType) => [...hackerNewsQueryKeys.feeds(), feedType] as const,
  stories: () => [...hackerNewsQueryKeys.all, 'story'] as const,
  story: (storyId: HackerNewsItem['id']) =>
    [...hackerNewsQueryKeys.stories(), storyId] as const,
}

export function feedStoriesQueryOptions(feedType: FeedType) {
  return queryOptions({
    queryKey: hackerNewsQueryKeys.feed(feedType),
    queryFn: async ({ signal, client }) => {
      const stories = await fetchStories(feedType, INITIAL_STORY_LIMIT, { signal })

      stories.forEach((story) => {
        client.setQueryData(hackerNewsQueryKeys.story(story.id), story)
      })

      return stories
    },
  })
}

export function storyDetailQueryOptions(storyId: HackerNewsItem['id']) {
  return queryOptions({
    queryKey: hackerNewsQueryKeys.story(storyId),
    queryFn: ({ signal }) => fetchStory(storyId, { signal }),
  })
}
