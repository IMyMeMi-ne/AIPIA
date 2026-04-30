import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NewsListPage from '@/pages/news-list/NewsListPage.tsx';
import { useGetHackerNewsList } from '@/features/hacker-news/model/useGetHackerNewsList.ts';
import { renderWithRouter } from '../../utils/react.tsx';
import {
  infiniteQueryError,
  infiniteQueryLoading,
  infiniteQuerySuccess,
} from '../../utils/react-query.ts';
import { makeStory } from '../../utils/stories.ts';

vi.mock('@/features/hacker-news/model/useGetHackerNewsList.ts', () => ({
  useGetHackerNewsList: vi.fn(),
}));

function storyPage(stories: ReturnType<typeof makeStory>[], cursor: number | null = null) {
  return {
    nextPageParam: cursor === null ? null : { cursor, storyIds: [] },
    stories,
  };
}

function hackerNewsListLoading() {
  return {
    ...infiniteQueryLoading(),
    paginationKey: 'top:0:end',
    stories: [],
  } as unknown as ReturnType<typeof useGetHackerNewsList>;
}

function hackerNewsListError(error: unknown, refetch = vi.fn()) {
  return {
    ...infiniteQueryError(error, refetch),
    paginationKey: 'top:0:end',
    stories: [],
  } as unknown as ReturnType<typeof useGetHackerNewsList>;
}

function hackerNewsListSuccess(
  pages: ReturnType<typeof storyPage>[],
  options: {
    fetchNextPage?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
  } = {},
) {
  return {
    ...infiniteQuerySuccess(pages, options),
    paginationKey: `top:${pages.length}:${pages.at(-1)?.nextPageParam?.cursor ?? 'end'}`,
    stories: pages.flatMap((page) => page.stories),
  } as unknown as ReturnType<typeof useGetHackerNewsList>;
}

function hackerNewsListNextPageError(
  pages: ReturnType<typeof storyPage>[],
  error: unknown,
  fetchNextPage = vi.fn(),
) {
  return {
    ...infiniteQueryError(error),
    data: {
      pageParams: pages.map((_, index) => index),
      pages,
    },
    fetchNextPage,
    hasNextPage: true,
    isFetchNextPageError: true,
    paginationKey: `top:${pages.length}:${pages.at(-1)?.nextPageParam?.cursor ?? 'end'}`,
    stories: pages.flatMap((page) => page.stories),
  } as unknown as ReturnType<typeof useGetHackerNewsList>;
}


describe('뉴스 목록 페이지', () => {
  beforeEach(() => {
    vi.mocked(useGetHackerNewsList).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('기본으로 톱 피드와 피드 탭을 렌더링한다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(hackerNewsListLoading());

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

  it('URL feed query를 초기 선택 피드로 사용한다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 7, title: 'Fresh story' })])]),
    );

    renderWithRouter(<NewsListPage />, { route: '/?feed=new' });

    expect(
      screen.getByRole('heading', { name: 'New Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(useGetHackerNewsList).toHaveBeenLastCalledWith('new');
    expect(
      screen.getByRole('link', { name: 'Read story: Fresh story' }),
    ).toHaveAttribute('href', '/stories/7?feed=new');
  });

  it('지원하지 않는 feed query는 기본 톱 피드로 처리한다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(hackerNewsListLoading());

    renderWithRouter(<NewsListPage />, { route: '/?feed=ask' });

    expect(
      screen.getByRole('heading', { name: 'Top Stories' }),
    ).toBeInTheDocument();
    expect(useGetHackerNewsList).toHaveBeenLastCalledWith('top');
  });

  it('선택된 피드를 불러오는 동안 로딩 스켈레톤을 보여준다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(hackerNewsListLoading());

    renderWithRouter(<NewsListPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading stories...');
  });

  it('피드 페이지 데이터 조회가 성공하면 누적 스토리 링크를 렌더링한다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([
        storyPage([
          makeStory({ id: 1, title: 'First story' }),
          makeStory({ id: 2, title: 'Second story' }),
        ]),
        storyPage([makeStory({ id: 3, title: 'Third story' })]),
      ]),
    );

    renderWithRouter(<NewsListPage />);

    expect(
      screen.getAllByRole('link', { name: 'Read story: First story' })[0],
    ).toHaveAttribute('href', '/stories/1');
    expect(
      screen.getAllByRole('link', { name: 'Read story: Second story' })[0],
    ).toHaveAttribute('href', '/stories/2');
    expect(
      screen.getAllByRole('link', { name: 'Read story: Third story' })[0],
    ).toHaveAttribute('href', '/stories/3');
  });

  it('가상 리스트 loader row가 가시 범위에 들어오면 다음 페이지를 요청한다', () => {
    const fetchNextPage = vi.fn();
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 1 })], 1)], {
        fetchNextPage,
        hasNextPage: true,
      }),
    );

    renderWithRouter(<NewsListPage />);

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('데스크톱 surface가 가상 row 하단을 자르지 않도록 overflow를 숨기지 않는다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 1 })], 1)], {
        hasNextPage: true,
      }),
    );

    const { container } = renderWithRouter(<NewsListPage />);

    expect(
      container.querySelector('.lg\\:overflow-hidden'),
    ).not.toBeInTheDocument();
  });

  it('다음 페이지가 있으면 더보기 버튼으로 인피니트 쿼리 다음 페이지를 요청한다', async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 1 })], 1)], {
        fetchNextPage,
        hasNextPage: true,
      }),
    );

    renderWithRouter(<NewsListPage />);
    fetchNextPage.mockClear();

    await user.click(screen.getByRole('button', { name: 'Load more stories' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('다음 페이지를 불러오는 동안 클릭 없는 loading status를 보여준다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 1 })], 1)], {
        hasNextPage: true,
        isFetchingNextPage: true,
      }),
    );

    renderWithRouter(<NewsListPage />);

    expect(
      screen.getByRole('status', { name: 'Loading more stories...' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Loading more stories...' }),
    ).not.toBeInTheDocument();
  });

  it('다음 페이지 조회만 실패하면 기존 스토리와 loader retry path를 유지한다', async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListNextPageError(
        [storyPage([makeStory({ id: 1, title: 'Persisted story' })], 1)],
        new Error('next page failed'),
        fetchNextPage,
      ),
    );

    renderWithRouter(<NewsListPage />);

    expect(
      screen.queryByText('Could not load stories'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Read story: Persisted story' }),
    ).toHaveAttribute('href', '/stories/1');
    expect(screen.getByRole('alert')).toHaveTextContent('next page failed');

    await user.click(
      screen.getByRole('button', { name: 'Try loading more stories again' }),
    );
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('오류 상태를 렌더링하고 다시 시도 시 재조회한다', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useGetHackerNewsList).mockReturnValue(hackerNewsListError(new Error('feed exploded'), refetch));

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

    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 1, title: 'Switchable story' })])]),
    );

    renderWithRouter(<NewsListPage />);
    expect(useGetHackerNewsList).toHaveBeenLastCalledWith('top');

    await user.click(screen.getByRole('button', { name: 'New' }));
    expect(
      screen.getByRole('heading', { name: 'New Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(useGetHackerNewsList).toHaveBeenLastCalledWith('new');
    expect(
      screen.getByRole('link', { name: 'Read story: Switchable story' }),
    ).toHaveAttribute('href', '/stories/1?feed=new');

    await user.click(screen.getByRole('button', { name: 'Best' }));
    expect(
      screen.getByRole('heading', { name: 'Best Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Best' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(useGetHackerNewsList).toHaveBeenLastCalledWith('best');
    expect(
      screen.getByRole('link', { name: 'Read story: Switchable story' }),
    ).toHaveAttribute('href', '/stories/1?feed=best');
  });
});
