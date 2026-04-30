import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getLastVirtualizerOptions,
  resetStoryGridVirtualizerMock,
  setVirtualRows,
  setVirtualizerViewport,
} from './storyGridVirtualizerMock.ts';
import StoryGrid from '@/features/hacker-news/ui/StoryGrid.tsx';
import {
  renderWithProviders,
  renderWithRouter,
} from '../../../../utils/react.tsx';
import { makeStory } from '../../../../utils/stories.ts';

describe('스토리 그리드', () => {
  beforeEach(() => {
    resetStoryGridVirtualizerMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('피드에 스토리가 없으면 빈 상태를 렌더링한다', () => {
    renderWithRouter(<StoryGrid stories={[]} />);

    expect(screen.getByText('No stories found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'There are no stories available for this feed right now.',
      ),
    ).toBeInTheDocument();
  });

  it('스토리가 없어도 다음 페이지가 남아 있으면 빈 상태 대신 loader row를 렌더링하고 요청한다', () => {
    const loadMore = vi.fn();

    setVirtualRows([0]);

    renderWithRouter(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[]}
      />,
    );

    expect(screen.queryByText('No stories found')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Load more stories' }),
    ).toBeInTheDocument();
    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('각 스토리를 강조 카드 없이 동일한 반응형 리스트 카드로 렌더링한다', () => {
    const first = makeStory({ id: 1, title: 'First story' });
    const second = makeStory({ id: 2, title: 'Second story' });

    setVirtualRows([0, 1]);

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

  it('가시 범위에 있는 virtual row만 렌더링한다', () => {
    const first = makeStory({ id: 1, title: 'First story' });
    const second = makeStory({ id: 2, title: 'Second story' });

    setVirtualRows([0]);

    renderWithRouter(<StoryGrid stories={[first, second]} />);

    expect(
      screen.getByRole('link', { name: 'Read story: First story' }),
    ).toHaveAttribute('href', '/stories/1');
    expect(
      screen.queryByRole('link', { name: 'Read story: Second story' }),
    ).not.toBeInTheDocument();
  });

  it('데스크톱 첫 렌더에서 측정 전 mobile estimate로 total height를 낮게 잡지 않는다', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 1038,
      toJSON: () => ({}),
      top: 0,
      width: 1038,
      x: 0,
      y: 0,
    });

    renderWithRouter(<StoryGrid stories={[makeStory({ id: 1 })]} />);

    expect(getLastVirtualizerOptions()?.estimateSize()).toBe(390);
  });

  it('데스크톱 viewport에서는 실제 리스트 폭이 1024px보다 작아도 여러 컬럼을 유지한다', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 800,
      toJSON: () => ({}),
      top: 0,
      width: 800,
      x: 0,
      y: 0,
    });

    const { container } = renderWithRouter(
      <StoryGrid
        stories={[
          makeStory({ id: 1 }),
          makeStory({ id: 2 }),
          makeStory({ id: 3 }),
        ]}
      />,
    );

    expect(
      container.querySelector('[style*="--story-grid-column-count: 2"]'),
    ).toBeInTheDocument();
    expect(getLastVirtualizerOptions()?.overscan).toBe(2);
  });

  it('loader virtual row가 가시 범위에 들어오면 다음 페이지를 요청한다', () => {
    const loadMore = vi.fn();

    setVirtualRows([0, 1]);

    renderWithRouter(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 })]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'Load more stories' }),
    ).toBeInTheDocument();
  });

  it('loader row가 overscan 범위에만 있으면 다음 페이지를 자동 요청하지 않는다', () => {
    const loadMore = vi.fn();

    setVirtualRows([0, 5]);
    setVirtualizerViewport({ height: 640, scrollOffset: 0 });

    renderWithRouter(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[
          makeStory({ id: 1 }),
          makeStory({ id: 2 }),
          makeStory({ id: 3 }),
          makeStory({ id: 4 }),
          makeStory({ id: 5 }),
        ]}
      />,
    );

    expect(loadMore).not.toHaveBeenCalled();
  });

  it('loader row가 viewport 바로 아래 trigger 거리 안에 들어오면 다음 페이지를 미리 요청한다', () => {
    const loadMore = vi.fn();

    setVirtualRows([0, 2]);
    setVirtualizerViewport({ height: 560, scrollOffset: 0 });

    renderWithRouter(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 }), makeStory({ id: 2 })]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('첫 렌더에서 loader row가 trigger 거리보다 멀면 자동 요청하지 않는다', () => {
    const loadMore = vi.fn();

    setVirtualRows([0, 2]);
    setVirtualizerViewport({ height: 520, scrollOffset: 0 });

    renderWithRouter(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 }), makeStory({ id: 2 })]}
      />,
    );

    expect(loadMore).not.toHaveBeenCalled();
  });

  it('non-zero scrollMargin에서도 window viewport와 교차한 loader row만 자동 요청한다', () => {
    const loadMore = vi.fn();

    setVirtualRows([0, 1]);
    setVirtualizerViewport({
      height: 320,
      scrollMargin: 240,
      scrollOffset: 240,
    });

    renderWithRouter(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 })]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('같은 loader 노출 구간에서는 fetching 상태가 false로 돌아와도 자동으로 재요청하지 않는다', () => {
    const loadMore = vi.fn();

    setVirtualRows([0, 1]);

    const { rerender } = renderWithProviders(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 })]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);

    rerender(
      <StoryGrid
        hasNextPage
        isFetchingNextPage
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 })]}
      />,
    );
    rerender(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 })]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('같은 길이와 row 수라도 story identity가 바뀌면 새 목록으로 보고 자동 로드한다', async () => {
    const loadMore = vi.fn();

    setVirtualRows([0, 1]);

    const { rerender } = renderWithProviders(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 1 })]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);

    rerender(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        stories={[makeStory({ id: 101 })]}
      />,
    );

    await waitFor(() => expect(loadMore).toHaveBeenCalledTimes(2));
  });

  it('표시 story가 그대로여도 pagination key가 전진하면 다음 페이지를 다시 자동 요청한다', async () => {
    const loadMore = vi.fn();
    const story = makeStory({ id: 1 });

    setVirtualRows([0, 1]);

    const { rerender } = renderWithProviders(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        paginationKey="top:1:30"
        stories={[story]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);

    rerender(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        paginationKey="top:2:60"
        stories={[story]}
      />,
    );

    await waitFor(() => expect(loadMore).toHaveBeenCalledTimes(2));
  });

  it('연속 empty page에서도 pagination key가 전진하면 다음 페이지를 다시 자동 요청한다', async () => {
    const loadMore = vi.fn();

    setVirtualRows([0]);

    const { rerender } = renderWithProviders(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        paginationKey="top:1:30"
        stories={[]}
      />,
    );

    expect(loadMore).toHaveBeenCalledTimes(1);

    rerender(
      <StoryGrid
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={loadMore}
        paginationKey="top:2:60"
        stories={[]}
      />,
    );

    await waitFor(() => expect(loadMore).toHaveBeenCalledTimes(2));
  });

  it('다음 페이지를 불러오는 동안 loader는 클릭 없는 loading status로 렌더링한다', () => {
    setVirtualRows([1]);

    renderWithRouter(
      <StoryGrid
        hasNextPage
        isFetchingNextPage
        onLoadMore={vi.fn()}
        stories={[makeStory({ id: 1 })]}
      />,
    );

    expect(
      screen.getByRole('status', { name: 'Loading more stories...' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Loading more stories...' }),
    ).not.toBeInTheDocument();
  });
});
