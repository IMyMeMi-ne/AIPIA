import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import NotFoundPage from '@/pages/not-found/NotFoundPage.tsx'

const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('없는 페이지 화면', () => {
  it('사용할 수 없는 라우트 안내를 보여주고 제목 클릭 시 홈으로 이동한다', async () => {
    const user = userEvent.setup()

    render(<NotFoundPage />)

    expect(screen.getByText('The requested route does not exist.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Route unavailable')
    expect(screen.getByText('Check the address or return to the main page.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'AIPIA News' }))
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
