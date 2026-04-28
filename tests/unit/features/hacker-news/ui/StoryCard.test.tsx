import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StoryCard from '@/features/hacker-news/ui/StoryCard.tsx';
import { buildStoryThumbnailUrl } from '@/features/hacker-news/lib/story.ts';
import { UNKNOWN_DATE_LABEL } from '@/shared/lib/date.ts';
import { renderWithRouter } from '../../../../utils/react.tsx';
import { makeStory } from '../../../../utils/stories.ts';

describe('스토리 카드', () => {
  it('기본 데스크톱 변형에서 작성자, 날짜, 상세 링크를 렌더링한다', () => {
    const story = makeStory({ id: 123, title: 'Desktop story', by: 'carol' });

    renderWithRouter(<StoryCard story={story} />);

    expect(
      screen.getByRole('link', { name: 'Read story: Desktop story' }),
    ).toHaveAttribute('href', '/stories/123');
    expect(screen.getByText('Desktop story')).toBeInTheDocument();
    expect(screen.getByText('carol')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('컴팩트와 대표 변형을 기대한 라벨과 함께 렌더링한다', () => {
    const story = makeStory({ id: 55, title: 'Variant story' });

    const featuredView = renderWithRouter(
      <StoryCard story={story} variant="featured" />,
    );
    expect(screen.getByText('Lead story')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Read story: Variant story' }),
    ).toHaveAttribute('href', '/stories/55');

    featuredView.unmount();
    renderWithRouter(<StoryCard story={story} variant="compact" />);
    expect(
      screen.getByRole('link', { name: 'Read story: Variant story' }),
    ).toHaveAttribute('href', '/stories/55');
  });

  it('알 수 없는 작성자와 날짜를 대체 표시하고 실패한 썸네일을 숨긴다', () => {
    const story = makeStory({ by: undefined, time: undefined, id: 404 });

    const { container } = renderWithRouter(<StoryCard story={story} />);

    expect(screen.getByText('Unknown author')).toBeInTheDocument();
    expect(screen.getByText(UNKNOWN_DATE_LABEL)).toBeInTheDocument();

    const image = container.querySelector('img');
    if (!image) {
      throw new Error('Expected thumbnail image to be rendered');
    }

    expect(image).toHaveAttribute('src', buildStoryThumbnailUrl(404));

    fireEvent.error(image);
    expect(image).toHaveStyle({ display: 'none' });
  });
});
