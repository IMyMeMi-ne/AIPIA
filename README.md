## 주요 기능

- Hacker News Top, New, Best 피드 조회
- 썸네일, 제목, 작성자, 작성일을 포함한 카드형 목록
- 스토리 상세 페이지에서 제목, 작성자, 점수, 작성일, 원문 URL 제공
- TanStack Query 기반 서버 상태 캐싱
- TanStack Virtual 기반 리스트 가상화
- 반응형 목록/그리드 레이아웃
- 라이트/다크 테마 전환

## 기술 스택

- React
- TypeScript
- Vite
- TanStack Query
- TanStack Virtual
- Tailwind CSS
- React Router
- Vitest

## 라우트

| 경로                | 설명        |
| ------------------- | ----------- |
| `/`                 | 스토리 목록 |
| `/stories/:storyId` | 스토리 상세 |
| `*`                 | 404 화면    |

상세 페이지와 404 화면에서는 `AIPIA News` 제목을 클릭해 목록으로 돌아갈 수 있습니다.

## 로컬 실행

```sh
pnpm install
pnpm dev
```

## 검증

```sh
pnpm lint
pnpm test
pnpm build
```
