import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewsListPage from '@/pages/news-list/NewsListPage.tsx';
import { feedStoriesQueryOptions } from '@/features/hacker-news/api/queries.ts';
import { renderWithRouter } from '../../utils/react.tsx';
import {
  queryError,
  queryLoading,
  querySuccess,
} from '../../utils/react-query.ts';
import { makeStory } from '../../utils/stories.ts';

vi.mock('@/features/hacker-news/api/queries.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/hacker-news/api/queries.ts')>();

  return {
    ...actual,
    feedStoriesQueryOptions: vi.fn(actual.feedStoriesQueryOptions),
  };
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();

  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

describe('뉴스 목록 페이지', () => {
  beforeEach(() => {
    vi.mocked(feedStoriesQueryOptions).mockClear();
    vi.mocked(useQuery).mockReset();
  });

  it('기본으로 톱 피드와 피드 탭을 렌더링한다', () => {
    vi.mocked(useQuery).mockReturnValue(queryLoading());

    renderWithRouter(<NewsListPage />);

    expect(
      screen.getByRole('heading', { name: 'AIPIA News' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Top Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Top' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('선택된 피드를 불러오는 동안 로딩 스켈레톤을 보여준다', () => {
    vi.mocked(useQuery).mockReturnValue(queryLoading());

    renderWithRouter(<NewsListPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading stories...');
  });

  it('피드 데이터 조회가 성공하면 스토리 링크를 렌더링한다', () => {
    vi.mocked(useQuery).mockReturnValue(
      querySuccess([
        makeStory({ id: 1, title: 'First story' }),
        makeStory({ id: 2, title: 'Second story' }),
      ]),
    );

    renderWithRouter(<NewsListPage />);

    expect(
      screen.getAllByRole('link', { name: 'Read story: First story' })[0],
    ).toHaveAttribute('href', '/stories/1');
    expect(
      screen.getAllByRole('link', { name: 'Read story: Second story' })[0],
    ).toHaveAttribute('href', '/stories/2');
  });

  it('오류 상태를 렌더링하고 다시 시도 시 재조회한다', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useQuery).mockReturnValue(queryError(new Error('feed exploded'), refetch));

    renderWithRouter(<NewsListPage />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not load stories',
    );
    expect(screen.getByText('feed exploded')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('피드 탭을 선택하면 피드 제목과 선택 상태를 전환한다', async () => {
    const user = userEvent.setup();

    vi.mocked(useQuery).mockReturnValue(querySuccess([makeStory({ id: 1 })]));

    renderWithRouter(<NewsListPage />);
    expect(feedStoriesQueryOptions).toHaveBeenLastCalledWith('top');

    await user.click(screen.getByRole('button', { name: 'New' }));
    expect(
      screen.getByRole('heading', { name: 'New Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(feedStoriesQueryOptions).toHaveBeenLastCalledWith('new');

    await user.click(screen.getByRole('button', { name: 'Best' }));
    expect(
      screen.getByRole('heading', { name: 'Best Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Best' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(feedStoriesQueryOptions).toHaveBeenLastCalledWith('best');
  });
});
