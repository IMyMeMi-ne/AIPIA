import {
  ESTIMATED_DESKTOP_ROW_HEIGHT_PX,
  ESTIMATED_MOBILE_ROW_HEIGHT_PX,
  MOBILE_COLUMN_COUNT,
  STORY_GRID_CARD_MIN_WIDTH_PX,
  STORY_GRID_DESKTOP_BREAKPOINT_PX,
  STORY_GRID_GAP_PX,
  VIRTUAL_STORY_OVERSCAN_TARGET,
} from './storyGridConstants.ts';

// 리스트 컨테이너 측정값. column 계산과 window virtualizer scrollMargin에 함께 사용
export type ListMetrics = {
  isDesktop: boolean;
  scrollMargin: number;
  width: number;
};

type VirtualRowBounds = {
  end: number;
  index: number;
  start: number;
};

// 첫 paint 전에 desktop 추정치를 주어 virtualizer가 mobile 높이로 과소 추정하지 않게함
export function getInitialIsDesktop() {
  return (
    typeof window !== 'undefined' &&
    window.innerWidth >= STORY_GRID_DESKTOP_BREAKPOINT_PX
  );
}

export function getInitialListWidth() {
  return getInitialIsDesktop() ? STORY_GRID_DESKTOP_BREAKPOINT_PX : 0;
}

// desktop 여부는 viewport 기준, column 수는 실제 list 폭 기준으로 계산
export function getStoryGridColumnCount(width: number, isDesktop: boolean) {
  if (!isDesktop) {
    return MOBILE_COLUMN_COUNT;
  }

  return Math.max(
    MOBILE_COLUMN_COUNT,
    Math.floor(
      (width + STORY_GRID_GAP_PX) /
        (STORY_GRID_CARD_MIN_WIDTH_PX + STORY_GRID_GAP_PX),
    ),
  );
}

export function getEstimatedRowHeight(columnCount: number) {
  return columnCount === MOBILE_COLUMN_COUNT
    ? ESTIMATED_MOBILE_ROW_HEIGHT_PX
    : ESTIMATED_DESKTOP_ROW_HEIGHT_PX;
}

// TanStack Virtual overscan은 row 개수 기준이라 column 수로 나눠 대략 같은 story 수를 유지한다.
export function getVirtualRowOverscan(columnCount: number) {
  return Math.max(
    1,
    Math.ceil(VIRTUAL_STORY_OVERSCAN_TARGET / columnCount),
  );
}

// virtualizer는 row 단위로 움직이므로 story 배열을 현재 column 수에 맞춰 row로 묶음
export function chunkItems<T>(items: T[], columnCount: number) {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += columnCount) {
    rows.push(items.slice(index, index + columnCount));
  }

  return rows;
}

// TanStack Virtual의 totalSize와 실제 virtual row end 중 큰 값을 써 하단 row 잘림을 방지
export function getVirtualContentHeight(
  virtualRows: VirtualRowBounds[],
  totalSize: number,
  scrollMargin: number,
) {
  return virtualRows.reduce(
    (height, virtualRow) => Math.max(height, virtualRow.end - scrollMargin),
    totalSize,
  );
}

type ViewportBoundsOptions = {
  measuredViewportHeight?: number;
  scrollOffset?: number | null;
};

// scrollRect가 아직 측정되지 않은 초기/테스트 환경에서는 window viewport로 fallback
export function getViewportBounds({
  measuredViewportHeight,
  scrollOffset,
}: ViewportBoundsOptions) {
  const start =
    scrollOffset ?? (typeof window === 'undefined' ? 0 : window.scrollY);
  const height =
    measuredViewportHeight !== undefined && measuredViewportHeight > 0
      ? measuredViewportHeight
      : typeof window === 'undefined'
        ? 0
        : window.innerHeight;

  return {
    end: start + height,
    start,
  };
}

type IsLoaderRowVisibleOptions = {
  hasNextPage: boolean;
  loaderRowIndex: number;
  viewportEnd: number;
  viewportStart: number;
  virtualRows: VirtualRowBounds[];
};

// overscan에 포함된 loader row가 아니라 실제 viewport와 교차한 loader row만 자동 load 대상으로 봄
export function isLoaderRowVisible({
  hasNextPage,
  loaderRowIndex,
  viewportEnd,
  viewportStart,
  virtualRows,
}: IsLoaderRowVisibleOptions) {
  return (
    hasNextPage &&
    virtualRows.some(
      (row) =>
        row.index === loaderRowIndex &&
        row.end > viewportStart &&
        row.start < viewportEnd,
    )
  );
}

type StoryIdentity = {
  id: number;
};

// 같은 loader 노출 구간에서 중복 자동 load를 막되, feed/page/story identity가 바뀌면 다시 허용
export function getStoryGridAutoLoadKey(
  paginationKey: string,
  loaderRowIndex: number,
  stories: StoryIdentity[],
) {
  const firstStoryId = stories[0]?.id ?? 'empty';
  const lastStoryId = stories.at(-1)?.id ?? 'empty';

  return `${paginationKey}:${loaderRowIndex}:${stories.length}:${firstStoryId}:${lastStoryId}`;
}
