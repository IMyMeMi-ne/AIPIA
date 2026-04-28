import type { HackerNewsStory } from '@/features/hacker-news/model/types.ts';

const DEFAULT_STORY_TIME = new Date(2024, 0, 1, 12).getTime() / 1000;

export function makeStory(
  overrides: Partial<HackerNewsStory> = {},
): HackerNewsStory {
  return {
    id: 100,
    type: 'story',
    by: 'alice',
    time: DEFAULT_STORY_TIME,
    title: 'A useful Hacker News story',
    url: 'https://www.example.com/posts/story',
    score: 42,
    descendants: 5,
    ...overrides,
  };
}
