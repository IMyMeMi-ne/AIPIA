import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import App from '@/app/App.tsx'

vi.mock('@/app/providers/QueryProvider.tsx', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="query-provider-shell">{children}</section>
  ),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()

  return {
    ...actual,
    RouterProvider: ({ router }: { router: unknown }) => (
      <div data-router-present={String(Boolean(router))}>Router provider mounted</div>
    ),
  }
})

describe('앱 루트', () => {
  it('쿼리 프로바이더 셸 내부에 라우터를 마운트한다', () => {
    render(<App />)

    const routerProvider = screen.getByText('Router provider mounted')

    expect(screen.getByTestId('query-provider-shell')).toContainElement(routerProvider)
    expect(routerProvider).toHaveAttribute('data-router-present', 'true')
  })
})
