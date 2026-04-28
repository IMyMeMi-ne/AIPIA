import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StoryDetailPanel from '@/features/hacker-news/ui/StoryDetailPanel.tsx';
import { NO_SOURCE_URL_LABEL } from '@/shared/lib/url.ts';
import { makeStory } from '../../../../utils/stories.ts';

describe('스토리 상세 패널', () => {
  it('스토리 식별 정보, 메타데이터, 안전한 외부 출처 링크를 렌더링한다', () => {
    render(
      <StoryDetailPanel
        story={makeStory({
          id: 321,
          title: 'Deep dive story',
          by: 'dave',
          score: 1,
          url: 'https://www.example.com/article',
        })}
      />,
    );

    expect(screen.getByText('Story #321')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Deep dive story' }),
    ).toBeInTheDocument();
    expect(screen.getByText('dave')).toBeInTheDocument();
    expect(screen.getByText('1 point')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();

    const sourceLink = screen.getByRole('link', {
      name: 'Open original story',
    });
    expect(sourceLink).toHaveAttribute(
      'href',
      'https://www.example.com/article',
    );
    expect(sourceLink).toHaveAttribute('target', '_blank');
    expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('작성자, 점수, 출처 주소가 없으면 대체 값을 사용한다', () => {
    render(
      <StoryDetailPanel
        story={makeStory({
          by: '   ',
          score: Number.NaN,
          url: 'javascript:alert(1)',
        })}
      />,
    );

    expect(screen.getByText('Unknown author')).toBeInTheDocument();
    expect(screen.getByText('Score unavailable')).toBeInTheDocument();
    expect(screen.getAllByText(NO_SOURCE_URL_LABEL)).toHaveLength(2);
    expect(
      screen.queryByRole('link', { name: 'Open original story' }),
    ).not.toBeInTheDocument();
  });

  it('1점이 아닌 점수에는 복수형을 사용한다', () => {
    render(<StoryDetailPanel story={makeStory({ score: 2 })} />);

    expect(screen.getByText('2 points')).toBeInTheDocument();
  });
});
