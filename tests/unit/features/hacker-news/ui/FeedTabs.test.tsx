import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FeedTabs from '@/features/hacker-news/ui/FeedTabs.tsx';

describe('피드 탭', () => {
  it('피드 버튼을 렌더링하고 선택된 피드만 눌림 상태로 표시한다', () => {
    render(<FeedTabs onSelectFeed={vi.fn()} selectedFeed="new" />);

    expect(screen.getByRole('button', { name: 'Top' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'New' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Best' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('탭을 클릭하면 선택된 피드를 전달한다', async () => {
    const user = userEvent.setup();
    const onSelectFeed = vi.fn();
    render(<FeedTabs onSelectFeed={onSelectFeed} selectedFeed="top" />);

    await user.click(screen.getByRole('button', { name: 'Best' }));

    expect(onSelectFeed).toHaveBeenCalledWith('best');
  });
});
