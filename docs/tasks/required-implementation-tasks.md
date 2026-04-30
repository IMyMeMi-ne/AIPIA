# Required Implementation Tasks

## TL;DR

이 문서는 AIPIA Hacker News 과제의 필수 요구사항을 구현 가능한 task로 쪼갠 작업 기준서다.
구현 구조는 축소형 FSD인 `app / pages / features / shared`를 따른다.

## Scope

필수 요구사항:

- Top Stories, New Stories, Best Stories 목록 표시
- 카드형 뉴스 항목
- 썸네일, 제목, 작성자, 작성일 표시
- Top/New/Best 탭 전환
- 카드 클릭 시 상세 페이지 이동
- 상세 페이지에서 제목, 작성자, 점수, 작성일, 글 URL 표시

비필수이지만 같이 고려할 사항:

- 로딩, 에러, 빈 상태
- API 캐싱과 중복 호출 방지
- 컴포넌트 재사용성
- TypeScript 타입 안정성
- 작은 디자인 시스템 기반의 일관된 UI
- light/dark theme preference

---

## Task 0. Baseline Cleanup

### Goal

Vite 기본 화면을 과제 구현이 가능한 빈 앱 구조로 전환한다.

### Work

- 기존 `src/App.tsx`의 Vite starter UI 제거
- 기존 starter 전용 CSS와 asset 사용 여부 정리
- `src/app`, `src/pages`, `src/features`, `src/shared` 폴더 생성
- `App.tsx`의 소유권을 `src/app`으로 이동할지 결정하고 적용

### Acceptance Criteria

- 앱 첫 화면이 더 이상 Vite starter 화면이 아니다.
- 이후 route/page 조립이 가능한 구조가 생긴다.
- `pnpm test`와 `pnpm build`가 통과한다.

### Harness Layer

- reliability
- architecture

---

## Task 1. Routing Foundation

### Goal

목록 페이지와 상세 페이지를 별도 route로 구성한다.

### Work

- 라우팅 방식 선택
  - 권장: `react-router-dom`
  - 대안: 최소 구현용 browser history 직접 처리
- route 정의
  - `/`: 뉴스 목록
  - `/stories/:storyId`: 뉴스 상세
- 페이지 컴포넌트 생성
  - `pages/news-list/NewsListPage.tsx`
  - `pages/story-detail/StoryDetailPage.tsx`

### Acceptance Criteria

- `/` 접근 시 목록 페이지 shell이 표시된다.
- `/stories/:storyId` 접근 시 상세 페이지 shell이 표시된다.
- 상세/에러 페이지에서 `AIPIA News` 제목 클릭으로 목록(`/`)에 돌아갈 수 있다.

### Harness Layer

- frontend

### Dependency

- Task 0

---

## Task 2. Hacker News API Model

### Goal

Hacker News API response를 TypeScript 타입과 명시적인 endpoint mapping으로 고정한다.

### Work

- `features/hacker-news/model/types.ts`
  - `FeedType`
  - `HackerNewsItem`
  - `HackerNewsStory`
- `features/hacker-news/model/constants.ts`
  - API base URL
  - feed endpoint mapping
  - initial story limit
- `features/hacker-news/lib/story.ts`
  - display 가능한 story 판별 함수
  - thumbnail URL builder

### Acceptance Criteria

- `top`, `new`, `best` feed type이 명시적으로 정의된다.
- endpoint mapping이 한 곳에 있다.
- `null`, `undefined`, `deleted`, `dead`, `type !== 'story'`, title 없는 item을 방어할 수 있다.
- thumbnail URL은 story id 기반으로 생성된다.

### Harness Layer

- domain-api
- integrations

### Dependency

- Task 0

---

## Task 3. API Fetch Layer

### Goal

Feed id 목록 조회와 item 상세 조회를 분리한 API wrapper를 만든다.

### Work

- `features/hacker-news/api/hackerNewsApi.ts`
  - `fetchStoryIds(feedType)`
  - `fetchItem(id)`
  - `fetchStory(id)`
- `features/hacker-news/api/queries.ts`
  - `fetchFeedStoryPage({ client, feedType, pageParam, signal })`
  - `feedStoriesInfiniteQueryOptions(feedType)`
- HTTP 실패 시 명확한 Error throw
- 일부 item 실패가 전체 목록 실패로 번지지 않도록 정책 결정

### Acceptance Criteria

- Top/New/Best id 목록을 각각 조회할 수 있다.
- 개별 story item을 조회할 수 있다.
- 목록 page 조회는 표시 가능한 story만 반환하고 같은 feed id snapshot 안에서 cursor를 진행한다.
- API base URL과 endpoint 문자열이 UI 컴포넌트에 흩어지지 않는다.

### Harness Layer

- domain-api
- integrations

### Dependency

- Task 2

---

## Task 4. Server State / Caching Layer

### Goal

목록과 상세 데이터의 중복 호출을 줄이고 로딩/에러 상태를 일관되게 제공한다.

### Work

- 서버 상태 도구 선택
  - 권장: TanStack Query
- `app/providers/QueryProvider.tsx` 생성
- `features/hacker-news/api/queries.ts`
  - feed stories query
  - story detail query
- query key 규칙 정의
  - `['hacker-news', 'feed', feedType]`
  - `['hacker-news', 'story', storyId]`
- feed query 성공 시 개별 story detail cache를 seed해 목록에서 받은 story를 상세에서 재사용 가능하게 한다.
- query key와 cache 재사용 정책은 `docs/query-keys/hacker-news.md`에 기록한다.

### Acceptance Criteria

- 같은 feed 재진입 시 캐시를 재사용할 수 있다.
- 목록에서 조회한 story 상세가 상세 페이지에서 재사용 가능한 구조다.
- 로딩/에러 상태가 page 또는 feature UI에서 사용할 수 있다.

### Harness Layer

- frontend
- reliability

### Dependency

- Task 3

---

## Task 5. Shared UI and Utilities

### Goal

도메인 의미가 없는 공통 UI와 유틸을 분리한다.

### Work

- `shared/lib/date.ts`
  - `Date`를 `yyyy-mm-dd` 문자열로 변환
  - Unix timestamp seconds를 `yyyy-mm-dd`로 변환
  - 예: `formatDateToYyyyMmDd(date?: Date)`, `formatUnixSecondsDate(time?: number)`
- `shared/lib/url.ts`
  - 외부 URL 표시/검증 helper
- `shared/ui/Skeleton.tsx`
- `shared/ui/ErrorState.tsx`
- `shared/ui/EmptyState.tsx`
- `shared/theme/*`
  - theme preference type, storage, resolution, provider/context

### Acceptance Criteria

- 날짜 변환 로직이 컴포넌트에 중복되지 않는다.
- 도메인 중립 상태 primitive가 목록과 상세에서 재사용된다.
- route/page loading UI는 spinner 대신 실제 콘텐츠 구조를 따르는 skeleton으로 제공된다.
- `shared`에는 Hacker News 전용 타입이나 endpoint가 없다.
- theme preference 저장/해석은 도메인 중립 `shared/theme`에 있으며 page/header 배치 정책은 소유하지 않는다.

### Harness Layer

- frontend
- domain-api

### Dependency

- Task 0

---

## Task 6. Design System Foundation

### Goal

목록과 상세 UI를 바로 만들기 전에, 과제 규모에 맞는 작은 디자인 시스템을 먼저 구축한다.
디자인 시스템은 화려한 브랜딩이 아니라 카드형 게시판을 일관되게 구현하기 위한 토큰, 공통 레이아웃, 기본 컴포넌트 기준을 제공한다.

### Work

- Tailwind CSS를 스타일링 도구로 사용
  - Vite plugin: `@tailwindcss/vite`
  - style entry: `src/index.css`의 `@import "tailwindcss";`와 `@theme` token
- Tailwind utility class와 최소 design token 기준 정의
  - color
  - typography
  - spacing
  - radius
  - shadow
  - layout width
  - light/dark token pair
- 공통 UI primitive 생성
  - `shared/ui/Button.tsx`
  - `shared/ui/Badge.tsx`
  - `shared/ui/PageShell.tsx`
  - `shared/ui/ThemeToggle.tsx`
  - 필요 시 `shared/ui/Surface.tsx`
- 상태 UI와 디자인 토큰 연결
  - `Skeleton`
  - `ErrorState`
  - `EmptyState`
- 목록/상세 화면에서 쓸 UI 기준 문서화 또는 코드 주석 최소화
  - 카드 radius
  - 탭 active state
  - 링크/버튼/theme toggle focus state
  - 모바일 breakpoint
- 구현 후 상세 기준은 `docs/architecture/design-system.md`에 유지한다.

### Acceptance Criteria

- 앱 전체가 사용할 기본 색상, 간격, 글꼴 크기, radius 기준이 있다.
- 공통 버튼/배지/page shell/theme toggle이 feature 의미 없이 재사용 가능하다.
- 공통 UI는 Hacker News 타입이나 endpoint를 import하지 않는다.
- 디자인 시스템은 과제의 와이어프레임을 구현하기에 충분하지만 과도한 컴포넌트 라이브러리가 아니다.
- `pnpm test`와 `pnpm build`가 통과한다.

### Harness Layer

- frontend
- reliability

### Dependency

- Task 5

---

## Task 7. News List UI

### Goal

Top/New/Best 탭과 카드형 뉴스 목록을 구현한다.

### Work

- `features/hacker-news/ui/FeedTabs.tsx`
- `features/hacker-news/ui/StoryCard.tsx`
- `features/hacker-news/ui/StoryGrid.tsx`
- `features/hacker-news/ui/StoryGridSkeleton.tsx`
- `pages/news-list/NewsListPage.tsx`에서 조립
- 카드 표시 정보
  - thumbnail
  - title
  - by
  - time (`yyyy-mm-dd`)
- 카드 클릭 시 상세 route 이동

### Acceptance Criteria

- 기본 진입 시 Top Stories가 표시된다.
- New, Best 탭 클릭 시 해당 목록이 표시된다.
- 각 카드에 썸네일, 제목, 작성자, `yyyy-mm-dd` 작성일이 표시된다.
- 카드 클릭 시 `/stories/:storyId`로 이동한다.
- 목록 loading/error/empty 상태가 구분된다.
- 목록 loading 상태는 모바일 compact list, 데스크톱 grid 구조를 따르는 skeleton으로 표시된다.
- skeleton은 reduced motion 설정을 존중하고, 보조기술에는 loading status text만 노출한다.
- 긴 목록은 viewport 근처 story row와 loader row만 DOM에 렌더링하면서 기존 `/stories/:storyId` navigation과 다음 page load trigger를 유지한다.
- loader row는 가시 범위에 들어오면 page 계층의 next-page callback을 호출하되 같은 노출 구간에서는 1회만 자동 호출한다. 실패 후 재시도는 loader button click으로 가능해야 한다.
- desktop column 여부는 viewport breakpoint로 판단하고, 실제 column 수는 measured list width로 계산한다. 가상 row 높이는 실제 DOM 측정값을 반영해 desktop row 하단이 clipping되지 않아야 한다.

### Harness Layer

- frontend

### Dependency

- Task 1
- Task 4
- Task 5
- Task 6

---

## Task 8. Story Detail UI

### Goal

뉴스 상세 페이지에서 필수 정보를 표시한다.

### Work

- `features/hacker-news/ui/StoryDetailPanel.tsx`
- `features/hacker-news/ui/StoryDetailSkeleton.tsx`
- `pages/story-detail/StoryDetailPage.tsx`에서 `storyId` param 사용
- 표시 정보
  - title
  - by
  - score
  - time (`yyyy-mm-dd`)
  - url
- URL이 없는 story fallback UI
- 목록 복귀 액션은 별도 back button 대신 `AIPIA News` title click event로 제공

### Acceptance Criteria

- `/stories/:storyId`에서 상세 데이터를 조회한다.
- 제목, 작성자, 점수, `yyyy-mm-dd` 작성일, 글 URL이 표시된다.
- URL이 있으면 안전한 외부 링크로 제공된다.
- URL이 없으면 깨진 링크 대신 URL 없음 상태가 표시된다.
- 상세 loading/error/unavailable 상태가 구분된다.
- 상세 loading 상태는 제목, 메타 카드, source URL 영역을 따르는 skeleton으로 표시된다.
- skeleton은 reduced motion 설정을 존중하고, 보조기술에는 loading status text만 노출한다.

### Harness Layer

- frontend
- integrations

### Dependency

- Task 1
- Task 4
- Task 5
- Task 6

---

## Task 9. UI Composition and Responsive Polish

### Goal

구축한 디자인 시스템을 목록/상세 UI에 적용해 와이어프레임에 맞는 깔끔한 게시판형 화면으로 정리한다.

### Work

- 앱 전체 layout 스타일 정리
- 탭 active/inactive 상태 스타일
- 카드 grid 반응형 스타일
- 카드 image 영역 안정화
- 상세 페이지 정보 hierarchy 정리
- 모바일 폭에서 텍스트 겹침 방지
- Tailwind utility 또는 합의된 디자인 토큰이 아닌 ad hoc 색상/간격 사용 최소화
- focus, hover, disabled 상태 점검

### Acceptance Criteria

- 목록 페이지가 게시판형 카드 UI로 보인다.
- desktop에서는 여러 카드가 grid로 배치된다.
- mobile에서는 읽기 쉬운 1열 또는 안정적인 layout을 사용한다.
- 긴 제목과 URL이 레이아웃을 깨뜨리지 않는다.
- 이미지 로딩 실패가 카드 높이를 무너뜨리지 않는다.

### Harness Layer

- frontend

### Dependency

- Task 6
- Task 7
- Task 8

---

## Task 10. Verification Pass

### Goal

필수 요구사항 충족 여부를 구현 후 검증한다.

### Work

- 정적 검증
  - `pnpm lint`
  - `pnpm build`
- 수동 smoke
  - `/`에서 Top 목록 확인
  - New 탭 확인
  - Best 탭 확인
  - 카드 클릭 후 상세 이동 확인
  - 상세 필수 정보 확인
  - 원문 URL 링크 확인
  - URL 없는 item fallback 가능성 확인
- 가능하면 브라우저에서 mobile/desktop viewport 확인

### Acceptance Criteria

- lint 통과
- build 통과
- 필수 요구사항 체크리스트 전부 통과
- 남은 미검증 범위가 final report에 기록된다.

### Harness Layer

- reliability

### Dependency

- Task 9

---

## Dependency Order

```txt
Task 0
  -> Task 1
  -> Task 2
  -> Task 3
  -> Task 4
  -> Task 5
  -> Task 6
  -> Task 7
  -> Task 8
  -> Task 9
  -> Task 10
```

Task 2, Task 3, Task 5는 일부 병렬 진행 가능하다.
Task 6은 UI 구현 전에 완료해야 한다.
하지만 현재 프로젝트 규모에서는 순차 구현이 더 단순하고 충돌 위험이 낮다.

## Requirement Coverage Map

| Requirement         | Covered By                     |
| ------------------- | ------------------------------ |
| Top Stories 목록    | Task 2, Task 3, Task 4, Task 7 |
| New Stories 목록    | Task 2, Task 3, Task 4, Task 7 |
| Best Stories 목록   | Task 2, Task 3, Task 4, Task 7 |
| 카드 형태 UI        | Task 6, Task 7, Task 9         |
| 썸네일 이미지       | Task 2, Task 7, Task 9         |
| 제목 표시           | Task 7, Task 8                 |
| 작성자 표시         | Task 7, Task 8                 |
| 작성일 `yyyy-mm-dd` 표시 | Task 5, Task 7, Task 8         |
| 탭 기능             | Task 7                         |
| 카드 클릭 상세 이동 | Task 1, Task 7                 |
| 상세 제목           | Task 8                         |
| 상세 작성자         | Task 8                         |
| 상세 점수           | Task 8                         |
| 상세 작성일 `yyyy-mm-dd` | Task 5, Task 8                 |
| 상세 글 URL         | Task 8                         |

## Implementation Notes

- `features/hacker-news`가 이 과제의 핵심 기능을 소유한다.
- `shared`에는 Hacker News 전용 컴포넌트를 넣지 않는다.
- API endpoint 문자열은 `features/hacker-news/model/constants.ts`에 모은다.
- UI 컴포넌트는 API endpoint를 직접 알지 않게 한다.
- 서버 상태 캐싱 도구를 추가하는 경우, dependency 추가 이유를 final report에 남긴다.
- 디자인 토큰과 공통 primitive는 `shared`에 두되, `StoryCard`나 `FeedTabs`처럼 과제 도메인을 가진 UI는 `features/hacker-news/ui`에 둔다.
- CSS 스타일 도구는 Tailwind CSS를 사용하며, 공통 스타일 패턴은 필요할 때 `shared/ui` primitive로 추출한다.
