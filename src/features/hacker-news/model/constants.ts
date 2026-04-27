import type { FeedType } from './types.ts'

export const HACKER_NEWS_API_BASE_URL = 'https://hacker-news.firebaseio.com/v0'

export const FEED_ENDPOINTS = {
  top: '/topstories.json',
  new: '/newstories.json',
  best: '/beststories.json',
} as const satisfies Record<FeedType, string>

export const INITIAL_STORY_LIMIT = 20

export const STORY_THUMBNAIL_WIDTH = 300
export const STORY_THUMBNAIL_HEIGHT = 200
export const STORY_THUMBNAIL_BASE_URL = 'https://picsum.photos/seed'
