import { EmptyState } from '../../../shared/ui/EmptyState.tsx'
import type { HackerNewsStory } from '../model/types.ts'
import StoryCard from './StoryCard.tsx'

type StoryGridProps = {
  stories: HackerNewsStory[]
}

function StoryGrid({ stories }: StoryGridProps) {
  if (stories.length === 0) {
    return (
      <EmptyState
        message="There are no stories available for this feed right now."
        title="No stories found"
      />
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4 lg:gap-5">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}

export default StoryGrid
