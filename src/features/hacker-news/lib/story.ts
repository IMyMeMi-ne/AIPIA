import {
  FEED_ENDPOINTS,
  STORY_THUMBNAIL_BASE_URL,
  STORY_THUMBNAIL_HEIGHT,
  STORY_THUMBNAIL_WIDTH,
} from '../model/constants.ts'
import type { FeedType, HackerNewsItem, HackerNewsStory } from '../model/types.ts'

function hasDisplayableTitle(title: HackerNewsItem['title']): title is string {
  return typeof title === 'string' && title.trim().length > 0
}

export function isDisplayableStory(
  item: HackerNewsItem | null | undefined,
): item is HackerNewsStory {
  return (
    item != null &&
    item.type === 'story' &&
    item.deleted !== true &&
    item.dead !== true &&
    hasDisplayableTitle(item.title)
  )
}

export function getFeedEndpoint(feedType: FeedType) {
  return FEED_ENDPOINTS[feedType]
}

export function buildStoryThumbnailUrl(storyId: HackerNewsStory['id']) {
  return `${STORY_THUMBNAIL_BASE_URL}/${storyId}/${STORY_THUMBNAIL_WIDTH}/${STORY_THUMBNAIL_HEIGHT}.webp`
}
