import { describe, expect, it, vi } from 'vitest'
import {
  fetchItem,
  fetchStory,
  fetchStoryIds,
} from '@/features/hacker-news/api/hackerNewsApi.ts'
import { HACKER_NEWS_API_BASE_URL } from '@/features/hacker-news/model/constants.ts'
import type { HackerNewsItem } from '@/features/hacker-news/model/types.ts'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status: 200,
    ...init,
  })
}

function textResponse(body: string, init: ResponseInit = {}) {
  return new Response(body, {
    headers: { 'content-type': 'application/json' },
    status: 200,
    ...init,
  })
}

function stubFetch(...responses: Array<Response | Promise<Response>>) {
  const fetchMock = vi.fn<typeof fetch>()

  responses.forEach((response) => {
    fetchMock.mockImplementationOnce(() => Promise.resolve(response))
  })

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

function abortError() {
  return Object.assign(new Error('aborted'), { name: 'AbortError' })
}

const storyItem: HackerNewsItem = {
  id: 101,
  type: 'story',
  title: 'Displayable story',
}

describe('스토리 식별자 목록 조회', () => {
  it('선택한 피드 엔드포인트에서 스토리 식별자를 가져온다', async () => {
    const fetchMock = stubFetch(jsonResponse([1, 2, 3]))

    await expect(fetchStoryIds('top')).resolves.toEqual([1, 2, 3])
    expect(fetchMock).toHaveBeenCalledWith(
      `${HACKER_NEWS_API_BASE_URL}/topstories.json`,
      { signal: undefined },
    )
  })

  it('형식이 잘못된 피드 응답을 거부한다', async () => {
    stubFetch(jsonResponse([1, '2', 3]))

    await expect(fetchStoryIds('new')).rejects.toThrow(
      'new story id 목록 응답 형식이 올바르지 않습니다',
    )
  })

  it('통신, 네트워크, 제이슨 파싱 실패를 리소스별 메시지로 감싼다', async () => {
    stubFetch(jsonResponse({ message: 'nope' }, { status: 503, statusText: 'Unavailable' }))
    await expect(fetchStoryIds('best')).rejects.toThrow(
      'best story id 목록 조회에 실패했습니다: 503 Unavailable',
    )

    const networkFetch = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error('offline'))
    vi.stubGlobal('fetch', networkFetch)
    await expect(fetchStoryIds('top')).rejects.toThrow(
      'top story id 목록 조회에 실패했습니다: offline',
    )

    stubFetch(textResponse('{invalid json'))
    await expect(fetchStoryIds('top')).rejects.toThrow(
      'top story id 목록 응답 파싱에 실패했습니다',
    )
  })

  it('중단 오류 실패는 감싸지 않는다', async () => {
    const error = abortError()
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValueOnce(error)
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchStoryIds('top')).rejects.toBe(error)
  })
})

describe('해커 뉴스 아이템 조회', () => {
  it('해커 뉴스 아이템을 반환하고 널 아이템 응답을 허용한다', async () => {
    stubFetch(jsonResponse(storyItem), jsonResponse(null))

    await expect(fetchItem(101)).resolves.toEqual(storyItem)
    await expect(fetchItem(102)).resolves.toBeNull()
  })

  it('숫자 식별자가 없는 아이템 응답을 거부한다', async () => {
    stubFetch(jsonResponse({ title: 'missing id' }), jsonResponse({ id: '123' }))

    await expect(fetchItem(101)).rejects.toThrow('Hacker News item이 필요합니다')
    await expect(fetchItem(123)).rejects.toThrow('숫자 id가 없습니다')
  })
})

describe('단일 스토리 조회', () => {
  it('표시 가능한 스토리만 반환한다', async () => {
    stubFetch(
      jsonResponse(storyItem),
      jsonResponse({ ...storyItem, id: 102, type: 'comment' }),
      jsonResponse({ ...storyItem, id: 103, deleted: true }),
      jsonResponse(null),
    )

    await expect(fetchStory(101)).resolves.toEqual(storyItem)
    await expect(fetchStory(102)).resolves.toBeNull()
    await expect(fetchStory(103)).resolves.toBeNull()
    await expect(fetchStory(104)).resolves.toBeNull()
  })
})
