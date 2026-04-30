// StoryGrid 테스트에서 TanStack Virtual의 window virtualizer 상태를 결정적으로 제어한다.
// 실제 스크롤/ResizeObserver에 의존하지 않고 virtual row와 viewport 교차 조건만 검증하기 위한 mock이다.
import { vi } from 'vitest';

type VirtualizerOptions = {
  count: number;
  estimateSize: () => number;
  overscan?: number;
};

const virtualizerMockState = vi.hoisted(() => ({
  lastOptions: null as VirtualizerOptions | null,
  measure: vi.fn(),
  measureElement: vi.fn(),
  scrollMargin: 0,
  scrollOffset: 0,
  viewportHeight: 640,
  virtualIndexes: [] as number[],
}));

vi.mock('@tanstack/react-virtual', () => ({
  useWindowVirtualizer: vi.fn((options: VirtualizerOptions) => {
    virtualizerMockState.lastOptions = options;

    return {
      getTotalSize: () => options.count * 320,
      getVirtualItems: () => virtualizerMockState.virtualIndexes.map((index) => ({
        end: (index + 1) * 320,
        index,
        key: `virtual-${index}`,
        size: 320,
        start: index * 320,
      })),
      measure: virtualizerMockState.measure,
      measureElement: virtualizerMockState.measureElement,
      options: {
        scrollMargin: virtualizerMockState.scrollMargin,
      },
      scrollOffset: virtualizerMockState.scrollOffset,
      scrollRect: {
        height: virtualizerMockState.viewportHeight,
        width: 1024,
      },
    };
  }),
}));

// 각 테스트가 이전 virtual row/viewport 상태에 오염되지 않도록 기본값으로 되돌린다.
export function resetStoryGridVirtualizerMock() {
  virtualizerMockState.measure.mockClear();
  virtualizerMockState.measureElement.mockClear();
  virtualizerMockState.lastOptions = null;
  virtualizerMockState.virtualIndexes = [0];
  virtualizerMockState.scrollMargin = 0;
  virtualizerMockState.scrollOffset = 0;
  virtualizerMockState.viewportHeight = 640;
}

// 현재 렌더링된 것으로 가정할 virtual row index 목록을 지정한다.
export function setVirtualRows(indexes: number[]) {
  virtualizerMockState.virtualIndexes = indexes;
}

type VirtualizerViewportOptions = {
  height?: number;
  scrollMargin?: number;
  scrollOffset?: number;
};

// loader row가 실제 viewport와 교차하는지 테스트하기 위한 scroll/height 값을 지정한다.
export function setVirtualizerViewport({
  height = virtualizerMockState.viewportHeight,
  scrollMargin = virtualizerMockState.scrollMargin,
  scrollOffset = virtualizerMockState.scrollOffset,
}: VirtualizerViewportOptions) {
  virtualizerMockState.viewportHeight = height;
  virtualizerMockState.scrollMargin = scrollMargin;
  virtualizerMockState.scrollOffset = scrollOffset;
}

// StoryGrid가 virtualizer에 넘긴 estimateSize 같은 option을 검증할 때 사용한다.
export function getLastVirtualizerOptions() {
  return virtualizerMockState.lastOptions;
}
