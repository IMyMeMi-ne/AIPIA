import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StoryCard from '@/features/hacker-news/ui/StoryCard.tsx';
import { buildStoryThumbnailUrl } from '@/features/hacker-news/lib/story.ts';
import {
  STORY_THUMBNAIL_HEIGHT,
  STORY_THUMBNAIL_WIDTH,
} from '@/features/hacker-news/model/constants.ts';
import { UNKNOWN_DATE_LABEL } from '@/shared/lib/date.ts';
import { renderWithRouter } from '../../../../utils/react.tsx';
import { makeStory } from '../../../../utils/stories.ts';

describe('스토리 카드', () => {
  it('동일한 리스트형 링크에서 제목, 작성자, 날짜, 상세 링크를 렌더링한다', () => {
    const story = makeStory({ id: 123, title: 'List story', by: 'carol' });

    renderWithRouter(<StoryCard story={story} />);

    expect(
      screen.getByRole('link', { name: 'Read story: List story' }),
    ).toHaveAttribute('href', '/stories/123');
    expect(screen.getByText('List story')).toBeInTheDocument();
    expect(screen.getByText('carol')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.queryByText('Lead story')).not.toBeInTheDocument();
  });

  it('우선순위 카드만 eager/high 이미지 로딩 힌트를 사용한다', () => {
    const story = makeStory({ id: 55, title: 'Priority story' });

    const priorityView = renderWithRouter(
      <StoryCard priority story={story} />,
    );
    const priorityImage = priorityView.container.querySelector('img');
    expect(priorityImage).toHaveAttribute(
      'height',
      String(STORY_THUMBNAIL_HEIGHT),
    );
    expect(priorityImage).toHaveAttribute('loading', 'eager');
    expect(priorityImage).toHaveAttribute('decoding', 'async');
    expect(priorityImage).toHaveAttribute('fetchpriority', 'high');
    expect(priorityImage).toHaveAttribute(
      'width',
      String(STORY_THUMBNAIL_WIDTH),
    );

    priorityView.unmount();
    const normalView = renderWithRouter(<StoryCard story={story} />);
    const normalImage = normalView.container.querySelector('img');
    expect(normalImage).toHaveAttribute('loading', 'lazy');
    expect(normalImage).toHaveAttribute('fetchpriority', 'auto');
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

  it('유효하지 않은 timestamp가 있어도 메타데이터 렌더링을 깨뜨리지 않는다', () => {
    renderWithRouter(
      <StoryCard story={makeStory({ id: 505, time: Number.MAX_VALUE })} />,
    );

    expect(screen.getByText(UNKNOWN_DATE_LABEL)).toBeInTheDocument();
  });
});
