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

let intersectionObserverCallback: IntersectionObserverCallback | null = null;
let intersectionObserverObserve = vi.fn();
let intersectionObserverDisconnect = vi.fn();

function installFakeIntersectionObserver() {
  intersectionObserverCallback = null;
  intersectionObserverObserve = vi.fn();
  intersectionObserverDisconnect = vi.fn();

  class FakeIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly scrollMargin = '';
    readonly thresholds = [];

    constructor(callback: IntersectionObserverCallback) {
      intersectionObserverCallback = callback;
    }

    observe = intersectionObserverObserve;
    unobserve = vi.fn();
    disconnect = intersectionObserverDisconnect;
    takeRecords = () => [];
  }

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
}

function triggerIntersection(isIntersecting: boolean) {
  intersectionObserverCallback?.(
    [{ isIntersecting } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

function storyPage(stories: ReturnType<typeof makeStory>[], cursor: number | null = null) {
  return {
    nextPageParam: cursor === null ? null : { cursor, storyIds: [] },
    stories,
  };
}

function hackerNewsListLoading() {
  return {
    ...infiniteQueryLoading(),
    stories: [],
  } as unknown as ReturnType<typeof useGetHackerNewsList>;
}

function hackerNewsListError(error: unknown, refetch = vi.fn()) {
  return {
    ...infiniteQueryError(error, refetch),
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
    stories: pages.flatMap((page) => page.stories),
  } as unknown as ReturnType<typeof useGetHackerNewsList>;
}


describe('뉴스 목록 페이지', () => {
  beforeEach(() => {
    vi.mocked(useGetHackerNewsList).mockReset();
    intersectionObserverCallback = null;
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

  it('하단 sentinel이 viewport에 가까워지면 다음 페이지를 요청하고 정리 시 observer를 해제한다', () => {
    installFakeIntersectionObserver();
    const fetchNextPage = vi.fn();
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 1 })], 1)], {
        fetchNextPage,
        hasNextPage: true,
      }),
    );

    const { unmount } = renderWithRouter(<NewsListPage />);

    expect(intersectionObserverObserve).toHaveBeenCalledTimes(1);
    triggerIntersection(true);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    unmount();
    expect(intersectionObserverDisconnect).toHaveBeenCalledTimes(1);
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

    await user.click(screen.getByRole('button', { name: 'Load more stories' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('다음 페이지를 불러오는 동안 더보기 버튼을 비활성화한다', () => {
    vi.mocked(useGetHackerNewsList).mockReturnValue(
      hackerNewsListSuccess([storyPage([makeStory({ id: 1 })], 1)], {
        hasNextPage: true,
        isFetchingNextPage: true,
      }),
    );

    renderWithRouter(<NewsListPage />);

    expect(
      screen.getByRole('button', { name: 'Loading more stories...' }),
    ).toBeDisabled();
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
      hackerNewsListSuccess([storyPage([makeStory({ id: 1 })])]),
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

    await user.click(screen.getByRole('button', { name: 'Best' }));
    expect(
      screen.getByRole('heading', { name: 'Best Stories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Best' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(useGetHackerNewsList).toHaveBeenLastCalledWith('best');
  });
});
