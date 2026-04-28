import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StoryGrid from '@/features/hacker-news/ui/StoryGrid.tsx';
import { renderWithRouter } from '../../../../utils/react.tsx';
import { makeStory } from '../../../../utils/stories.ts';

describe('스토리 그리드', () => {
  it('피드에 스토리가 없으면 빈 상태를 렌더링한다', () => {
    renderWithRouter(<StoryGrid stories={[]} />);

    expect(screen.getByText('No stories found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'There are no stories available for this feed right now.',
      ),
    ).toBeInTheDocument();
  });

  it('첫 스토리는 대표/모바일로, 전체 스토리는 데스크톱 그리드로 렌더링한다', () => {
    const first = makeStory({ id: 1, title: 'First story' });
    const second = makeStory({ id: 2, title: 'Second story' });

    renderWithRouter(<StoryGrid stories={[first, second]} />);

    expect(
      screen.getAllByRole('link', { name: 'Read story: First story' }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole('link', { name: 'Read story: Second story' }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole('link', { name: 'Read story: First story' })[0],
    ).toHaveAttribute('href', '/stories/1');
    expect(
      screen.getAllByRole('link', { name: 'Read story: Second story' })[0],
    ).toHaveAttribute('href', '/stories/2');
  });
});
