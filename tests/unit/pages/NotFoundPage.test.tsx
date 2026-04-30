import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import NotFoundPage from '@/pages/not-found/NotFoundPage.tsx'
import { renderWithTheme } from '../../utils/react.tsx'

const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('없는 페이지 화면', () => {
  it('레퍼런스 구조에 맞춘 404 안내와 복구 액션을 보여준다', () => {
    renderWithTheme(<NotFoundPage />)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument()
    expect(screen.queryByText('/unknown/story?from=feed#comments')).not.toBeInTheDocument()
    expect(screen.queryByText('Try one of these instead')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Return Home' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument()
  })

  it('브랜드와 주요 액션으로 홈 이동을 제공한다', async () => {
    const user = userEvent.setup()

    renderWithTheme(<NotFoundPage />)

    await user.click(screen.getByRole('button', { name: 'AIPIA News' }))
    expect(navigateMock).toHaveBeenCalledWith('/')

    await user.click(screen.getByRole('button', { name: 'Return Home' }))
    expect(navigateMock).toHaveBeenLastCalledWith('/')
  })
})
