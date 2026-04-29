import { describe, expect, it } from 'vitest'
import { isValidElement } from 'react'
import type { RouteObject } from 'react-router-dom'
import { appRoutes } from '@/app/router.tsx'

type LazyPageRoute = RouteObject & {
  lazy: () => Promise<{ Component?: unknown }>
}

function getLazyPageRoute(path: string) {
  const route = appRoutes.find((candidate) => candidate.path === path)

  expect(route).toBeDefined()
  expect(route).not.toHaveProperty('element')
  expect(isValidElement(route?.errorElement)).toBe(true)
  expect(isValidElement(route?.hydrateFallbackElement)).toBe(true)
  expect(typeof route?.lazy).toBe('function')

  return route as LazyPageRoute
}

describe('앱 라우터', () => {
  it('구현된 페이지 라우트를 우선순위 순서대로 등록한다', () => {
    expect(appRoutes.map((route) => route.path)).toEqual(['/', '/stories/:storyId', '*'])
  })

  it('첫 진입 번들에는 목록 페이지만 정적으로 등록한다', () => {
    expect(appRoutes[0]).toHaveProperty('element')
    expect(appRoutes[0]).not.toHaveProperty('lazy')
    expect(getLazyPageRoute('/stories/:storyId')).toBeDefined()
    expect(getLazyPageRoute('*')).toBeDefined()
  })

  it('지연 라우트의 chunk loading fallback과 error UI를 eager로 등록한다', () => {
    expect(getLazyPageRoute('/stories/:storyId').hydrateFallbackElement).toBeDefined()
    expect(getLazyPageRoute('/stories/:storyId').errorElement).toBeDefined()
    expect(getLazyPageRoute('*').hydrateFallbackElement).toBeDefined()
    expect(getLazyPageRoute('*').errorElement).toBeDefined()
  })

  it('상세와 404 페이지는 라우트 지연 로더로 해석된다', async () => {
    await expect(getLazyPageRoute('/stories/:storyId').lazy()).resolves.toEqual({
      Component: expect.any(Function),
    })
    await expect(getLazyPageRoute('*').lazy()).resolves.toEqual({
      Component: expect.any(Function),
    })
  })
})
