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

  it('각 스토리를 강조 카드 없이 동일한 반응형 리스트 카드로 렌더링한다', () => {
    const first = makeStory({ id: 1, title: 'First story' });
    const second = makeStory({ id: 2, title: 'Second story' });

    const { container } = renderWithRouter(
      <StoryGrid stories={[first, second]} />,
    );

    expect(
      screen.getByRole('link', { name: 'Read story: First story' }),
    ).toHaveAttribute('href', '/stories/1');
    expect(
      screen.getByRole('link', { name: 'Read story: Second story' }),
    ).toHaveAttribute('href', '/stories/2');
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[0]).toHaveAttribute('fetchpriority', 'high');
    expect(images[1]).toHaveAttribute('loading', 'lazy');
    expect(images[1]).toHaveAttribute('fetchpriority', 'auto');
    expect(screen.queryByText('Lead story')).not.toBeInTheDocument();
  });
});
