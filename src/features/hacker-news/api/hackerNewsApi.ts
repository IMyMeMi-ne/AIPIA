import {
  HACKER_NEWS_API_BASE_URL,
  INITIAL_STORY_LIMIT,
} from '../model/constants.ts';
import type {
  FeedType,
  HackerNewsItem,
  HackerNewsStory,
} from '../model/types.ts';
import { getFeedEndpoint, isDisplayableStory } from '../lib/story.ts';

// API base URL과 endpoint path를 결합해 실제 요청 URL을 만듦
function buildApiUrl(endpoint: string) {
  return `${HACKER_NEWS_API_BASE_URL}${endpoint}`;
}

// HN item 상세 조회 endpoint는 id 기반으로만 조립
function getItemEndpoint(id: HackerNewsItem['id']) {
  return `/item/${id}.json`;
}

// unknown catch 값을 사용자/로그에 남길 수 있는 문자열로 정규화
function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

// 공통 JSON fetch helper: 네트워크, HTTP 상태, JSON 파싱 실패를 명확한 Error로 변경
async function fetchJson(
  endpoint: string,
  resourceName: string,
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(buildApiUrl(endpoint));
  } catch (error) {
    throw new Error(
      `${resourceName} 조회에 실패했습니다: ${getErrorMessage(error)}`,
      {
        cause: error,
      },
    );
  }

  if (!response.ok) {
    throw new Error(
      `${resourceName} 조회에 실패했습니다: ${response.status} ${response.statusText}`,
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(
      `${resourceName} 응답 파싱에 실패했습니다: ${getErrorMessage(error)}`,
      {
        cause: error,
      },
    );
  }
}

// feed API 응답이 story id 숫자 배열인지 확인
function isStoryIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((id) => Number.isInteger(id));
}

// item 상세 요청이 과도하게 늘지 않도록 limit을 안전한 정수 범위로 정규화
function normalizeLimit(limit: number) {
  if (!Number.isFinite(limit)) {
    return INITIAL_STORY_LIMIT;
  }

  return Math.max(0, Math.floor(limit));
}

// raw JSON을 HN item 경계 타입으로 좁히고, null item은 그대로 허용
function toHackerNewsItem(
  value: unknown,
  resourceName: string,
): HackerNewsItem | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'object' || !('id' in value)) {
    throw new Error(
      `${resourceName} 응답 형식이 올바르지 않습니다: Hacker News item이 필요합니다`,
    );
  }

  const item = value as Partial<HackerNewsItem>;

  if (!Number.isInteger(item.id)) {
    throw new Error(
      `${resourceName} 응답 형식이 올바르지 않습니다: 숫자 id가 없습니다`,
    );
  }

  return item as HackerNewsItem;
}

export async function fetchStoryIds(feedType: FeedType) {
  const response = await fetchJson(
    getFeedEndpoint(feedType),
    `${feedType} story id 목록`,
  );

  if (!isStoryIdList(response)) {
    throw new Error(
      `${feedType} story id 목록 응답 형식이 올바르지 않습니다: 숫자 배열이 필요합니다`,
    );
  }

  return response;
}

export async function fetchItem(id: HackerNewsItem['id']) {
  const resourceName = `Hacker News item ${id}`;
  const response = await fetchJson(getItemEndpoint(id), resourceName);

  return toHackerNewsItem(response, resourceName);
}

export async function fetchStory(
  id: HackerNewsItem['id'],
): Promise<HackerNewsStory | null> {
  const item = await fetchItem(id);

  return isDisplayableStory(item) ? item : null;
}

export async function fetchStories(
  feedType: FeedType,
  limit = INITIAL_STORY_LIMIT,
): Promise<HackerNewsStory[]> {
  const storyIds = await fetchStoryIds(feedType);
  const limitedStoryIds = storyIds.slice(0, normalizeLimit(limit));

  const stories = await Promise.all(
    limitedStoryIds.map(async (storyId) => {
      try {
        return await fetchStory(storyId);
      } catch {
        return null;
      }
    }),
  );

  return stories.filter(isDisplayableStory);
}
