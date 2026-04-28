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
    <div
      aria-label="Story feed"
      className="grid w-full grid-cols-3 gap-2 rounded-(--ds-radius-card) border border-(--ds-color-border) bg-(--ds-color-surface) p-1 sm:flex sm:w-auto sm:flex-wrap"
      role="group"
    >
      {FEED_TYPES.map((feedType) => {
        const isSelected = feedType === selectedFeed

        return (
          <Button
            aria-pressed={isSelected}
            className={
              isSelected
                ? 'min-w-0 whitespace-nowrap shadow-sm'
                : 'min-w-0 whitespace-nowrap border-transparent bg-transparent text-app-muted shadow-none hover:text-app-foreground'
            }
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
