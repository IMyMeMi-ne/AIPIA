import { EmptyState } from '@/shared/ui/EmptyState.tsx';
import type { HackerNewsStory } from '../model/types.ts';
import StoryCard from './StoryCard.tsx';

const FIRST_STORY_INDEX = 0;

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

  return (
    <div className="grid gap-0 divide-y divide-(--ds-color-border) border-y border-(--ds-color-border) lg:grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] lg:gap-5 lg:divide-y-0 lg:border-y-0">
      {stories.map((story, index) => (
        <StoryCard
          key={story.id}
          priority={index === FIRST_STORY_INDEX}
          story={story}
        />
      ))}
    </div>
  );
}

export default StoryGrid;
