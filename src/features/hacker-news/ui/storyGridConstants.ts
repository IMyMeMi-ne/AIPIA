// StoryGrid 전용 layout/virtualization 수치다.
// Hacker News domain 값이 아니므로 model/constants가 아니라 ui 근처에 둔다.

// 첫 번째 story 이미지만 eager/high priority로 로드하기 위한 기준 index.
export const FIRST_STORY_INDEX = 0;

// 모바일 리스트는 항상 1열로 렌더링한다.
export const MOBILE_COLUMN_COUNT = 1;

// Tailwind lg breakpoint와 맞춘 StoryGrid desktop layout 전환 기준.
export const STORY_GRID_DESKTOP_BREAKPOINT_PX = 1024;

// Desktop grid에서 카드가 유지해야 하는 최소 폭.
export const STORY_GRID_CARD_MIN_WIDTH_PX = 288;

// Desktop grid column/row 사이 간격.
export const STORY_GRID_GAP_PX = 20;

// 모바일 list row의 초기 virtualizer 추정 높이.
export const ESTIMATED_MOBILE_ROW_HEIGHT_PX = 113;

// Desktop card row의 초기 virtualizer 추정 높이.
export const ESTIMATED_DESKTOP_ROW_HEIGHT_PX = 390;

// 스크롤 전후로 미리 렌더링할 목표 story 개수. 실제 overscan row 수는 column 수에 맞춰 계산한다.
export const VIRTUAL_STORY_OVERSCAN_TARGET = 4;
