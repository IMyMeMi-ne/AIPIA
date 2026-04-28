import { FEED_TYPES } from '../model/types.ts';
import type { FeedType } from '../model/types.ts';
import { Button } from '@/shared/ui/Button.tsx';

type FeedTabsProps = {
  selectedFeed: FeedType;
  onSelectFeed: (feedType: FeedType) => void;
};

const feedLabels: Record<FeedType, string> = {
  top: 'Top',
  new: 'New',
  best: 'Best',
};

const baseTabClassName =
  'min-h-9 min-w-0 rounded-none border-b-2 px-0 text-lg shadow-none hover:bg-transparent lg:min-h-10 lg:rounded-(--ds-radius-control) lg:border lg:px-4 lg:text-sm';

const selectedTabClassName =
  'border-app-foreground bg-transparent text-app-foreground lg:border-(--ds-color-border) lg:bg-(--ds-color-surface) lg:shadow-[0_1px_2px_rgb(21_23_26/0.06)] lg:hover:bg-(--ds-color-surface)';

const idleTabClassName =
  'border-transparent bg-transparent text-app-muted hover:text-app-foreground lg:text-app-muted lg:hover:bg-(--ds-color-surface) lg:hover:text-app-foreground';

function FeedTabs({ selectedFeed, onSelectFeed }: FeedTabsProps) {
  return (
    <div
      aria-label="Story feed"
      className="flex w-full gap-8 bg-transparent p-0 lg:grid lg:w-auto lg:grid-cols-3 lg:gap-1.5 lg:rounded-(--ds-radius-card) lg:border lg:border-(--ds-color-border) lg:bg-(--ds-color-surface-muted) lg:p-1"
      role="group"
    >
      {FEED_TYPES.map((feedType) => {
        const isSelected = feedType === selectedFeed;

        return (
          <Button
            aria-pressed={isSelected}
            className={
              isSelected
                ? `${baseTabClassName} ${selectedTabClassName}`
                : `${baseTabClassName} ${idleTabClassName}`
            }
            key={feedType}
            onClick={() => onSelectFeed(feedType)}
            variant="ghost"
          >
            {feedLabels[feedType]}
          </Button>
        );
      })}
    </div>
  );
}

export default FeedTabs;
