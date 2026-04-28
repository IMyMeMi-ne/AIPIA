import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StoryDetailPage from '@/pages/story-detail/StoryDetailPage.tsx';
import {
  queryError,
  queryIdle,
  queryLoading,
  querySuccess,
} from '../../utils/react-query.ts';
import { makeStory } from '../../utils/stories.ts';
import { renderWithTheme } from '../../utils/react.tsx';

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: { storyId: '123' as string | undefined },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigate: () => routerMocks.navigate,
    useParams: () => routerMocks.params,
  };
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();

  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

function setStoryId(storyId: string | undefined) {
  routerMocks.params.storyId = storyId;
}

describe('스토리 상세 페이지', () => {
  beforeEach(() => {
    routerMocks.navigate.mockReset();
    routerMocks.params.storyId = '123';
    vi.mocked(useQuery).mockReset();
  });

  it.each([
    undefined,
    '',
    '   ',
    'abc',
    '0',
    '-1',
    '1.2',
    String(Number.MAX_SAFE_INTEGER + 1),
  ])(
    '잘못된 스토리 식별자 파라미터면 오류 안내를 렌더링한다',
    (storyId) => {
      setStoryId(storyId);
      vi.mocked(useQuery).mockReturnValue(queryIdle());

      renderWithTheme(<StoryDetailPage />);

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid story ID');
      expect(
        screen.getByText(
          'The story route needs a positive numeric Hacker News story ID.',
        ),
      ).toBeInTheDocument();
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false }),
      );
    },
  );

  it('유효한 스토리 식별자에서는 로딩 스켈레톤을 보여준다', () => {
    setStoryId('123');
    vi.mocked(useQuery).mockReturnValue(queryLoading());

    renderWithTheme(<StoryDetailPage />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading story detail...',
    );
  });

  it('표시 가능한 스토리 조회가 성공하면 상세 데이터를 렌더링한다', () => {
    setStoryId('123');
    vi.mocked(useQuery).mockReturnValue(
      querySuccess(makeStory({ id: 123, title: 'Loaded story', by: 'erin' })),
    );

    renderWithTheme(<StoryDetailPage />);

    expect(screen.getByText('Story #123')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Loaded story' }),
    ).toBeInTheDocument();
    expect(screen.getByText('erin')).toBeInTheDocument();
  });

  it('유효한 스토리 식별자가 널로 조회되면 스토리 없음 상태를 렌더링한다', () => {
    setStoryId('123');
    vi.mocked(useQuery).mockReturnValue(querySuccess(null));

    renderWithTheme(<StoryDetailPage />);

    expect(screen.getByText('Story unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This Hacker News item is deleted, dead, missing, or not a displayable story.',
      ),
    ).toBeInTheDocument();
  });

  it('오류 상태를 렌더링하고 다시 시도 시 재조회한다', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    setStoryId('123');
    vi.mocked(useQuery).mockReturnValue(queryError(new Error('detail exploded'), refetch));

    renderWithTheme(<StoryDetailPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load story');
    expect(screen.getByText('detail exploded')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('페이지 제목을 클릭하면 홈으로 이동한다', async () => {
    const user = userEvent.setup();

    setStoryId('123');
    vi.mocked(useQuery).mockReturnValue(querySuccess(makeStory({ id: 123 })));

    renderWithTheme(<StoryDetailPage />);

    await user.click(screen.getByRole('button', { name: 'AIPIA News' }));
    expect(routerMocks.navigate).toHaveBeenCalledWith('/');
  });
});
