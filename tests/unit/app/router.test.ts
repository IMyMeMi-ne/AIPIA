import { describe, expect, it } from 'vitest'
import { appRoutes } from '@/app/router.tsx'

describe('앱 라우터', () => {
  it('구현된 페이지 라우트를 우선순위 순서대로 등록한다', () => {
    expect(appRoutes.map((route) => route.path)).toEqual(['/', '/stories/:storyId', '*'])
  })
})
