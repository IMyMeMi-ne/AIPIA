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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}

export default StoryGrid
