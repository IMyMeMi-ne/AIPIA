import { describe, expect, it } from 'vitest'
import {
  buildStoryThumbnailUrl,
  getFeedEndpoint,
  isDisplayableStory,
} from '@/features/hacker-news/lib/story.ts'
import { STORY_THUMBNAIL_BASE_URL } from '@/features/hacker-news/model/constants.ts'
import type { HackerNewsItem } from '@/features/hacker-news/model/types.ts'

const displayableStory: HackerNewsItem = {
  id: 1,
  type: 'story',
  title: 'Displayable story',
}

describe('표시 가능한 스토리 판별', () => {
  it('삭제되지 않고 제목이 비어 있지 않은 스토리를 허용한다', () => {
    expect(isDisplayableStory(displayableStory)).toBe(true)
  })

  it('없거나 삭제되었거나 죽었거나 스토리가 아니거나 제목이 없는 아이템을 거부한다', () => {
    expect(isDisplayableStory(null)).toBe(false)
    expect(isDisplayableStory(undefined)).toBe(false)
    expect(isDisplayableStory({ ...displayableStory, deleted: true })).toBe(false)
    expect(isDisplayableStory({ ...displayableStory, dead: true })).toBe(false)
    expect(isDisplayableStory({ ...displayableStory, type: 'comment' })).toBe(false)
    expect(isDisplayableStory({ ...displayableStory, title: '   ' })).toBe(false)
    expect(isDisplayableStory({ id: 2, type: 'story' })).toBe(false)
  })
})

describe('피드 엔드포인트 조회', () => {
  it('지원하는 피드 타입을 해커 뉴스 엔드포인트로 매핑한다', () => {
    expect(getFeedEndpoint('top')).toBe('/topstories.json')
    expect(getFeedEndpoint('new')).toBe('/newstories.json')
    expect(getFeedEndpoint('best')).toBe('/beststories.json')
  })
})

describe('스토리 썸네일 주소 생성', () => {
  it('스토리 식별자로 결정적인 시드 썸네일 주소를 만든다', () => {
    expect(buildStoryThumbnailUrl(123)).toBe(`${STORY_THUMBNAIL_BASE_URL}/123/300/200.webp`)
  })
})
