import { FEED_TYPES } from '../model/types.ts'
import type { FeedType } from '../model/types.ts'
import { Button } from '../../../shared/ui/Button.tsx'

type FeedTabsProps = {
  selectedFeed: FeedType
  onSelectFeed: (feedType: FeedType) => void
}

const feedLabels: Record<FeedType, string> = {
  top: 'Top',
  new: 'New',
  best: 'Best',
}

function FeedTabs({ selectedFeed, onSelectFeed }: FeedTabsProps) {
  return (
    <div aria-label="Story feed" className="flex flex-wrap gap-2" role="group">
      {FEED_TYPES.map((feedType) => {
        const isSelected = feedType === selectedFeed

        return (
          <Button
            aria-pressed={isSelected}
            key={feedType}
            onClick={() => onSelectFeed(feedType)}
            variant={isSelected ? 'primary' : 'secondary'}
          >
            {feedLabels[feedType]}
          </Button>
        )
      })}
    </div>
  )
}

export default FeedTabs
