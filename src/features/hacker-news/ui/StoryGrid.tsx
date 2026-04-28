import { EmptyState } from '@/shared/ui/EmptyState.tsx';
import type { HackerNewsStory } from '../model/types.ts';
import StoryCard from './StoryCard.tsx';

const FEATURED_STORY_INDEX = 0;

type StoryGridProps = {
  stories: HackerNewsStory[];
};

function StoryGrid({ stories }: StoryGridProps) {
  if (stories.length === 0) {
    return (
      <EmptyState
        message="There are no stories available for this feed right now."
        title="No stories found"
      />
    );
  }

  const featuredStory = stories[FEATURED_STORY_INDEX];
  const streamStories = stories.slice(1);

  return (
    <>
      <div className="lg:hidden">
        <StoryCard story={featuredStory} variant="featured" />
        <div className="mt-3 divide-y divide-(--ds-color-border) border-y border-(--ds-color-border)">
          {streamStories.map((story) => (
            <StoryCard key={story.id} story={story} variant="compact" />
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-5 lg:grid">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} variant="desktop" />
        ))}
      </div>
    </>
  );
}

export default StoryGrid;
