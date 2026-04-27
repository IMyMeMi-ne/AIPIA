export const FEED_TYPES = ['top', 'new', 'best'] as const

export type FeedType = (typeof FEED_TYPES)[number]

export type HackerNewsItemType = 'job' | 'story' | 'comment' | 'poll' | 'pollopt'

export type HackerNewsItem = {
  id: number
  type?: HackerNewsItemType
  by?: string
  time?: number
  title?: string
  url?: string
  score?: number
  descendants?: number
  dead?: boolean
  deleted?: boolean
}

export type HackerNewsStory = HackerNewsItem & {
  type: 'story'
  title: string
  dead?: false  
  deleted?: false
}
