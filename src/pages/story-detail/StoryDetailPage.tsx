import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { storyDetailQueryOptions } from '@/features/hacker-news/api/queries.ts';
import StoryDetailPanel from '@/features/hacker-news/ui/StoryDetailPanel.tsx';
import { Button } from '@/shared/ui/Button.tsx';
import { EmptyState } from '@/shared/ui/EmptyState.tsx';
import { ErrorState } from '@/shared/ui/ErrorState.tsx';
import { LoadingState } from '@/shared/ui/LoadingState.tsx';
import { PageShell } from '@/shared/ui/PageShell.tsx';
import { Surface } from '@/shared/ui/Surface.tsx';

function parseStoryId(storyId: string | undefined) {
  if (storyId === undefined || storyId.trim().length === 0) {
    return null;
  }

  const parsedStoryId = Number(storyId);

  if (!Number.isSafeInteger(parsedStoryId) || parsedStoryId <= 0) {
    return null;
  }

  return parsedStoryId;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Story detail could not be loaded.';
}

function StoryDetailPage() {
  const navigate = useNavigate();
  const { storyId: storyIdParam } = useParams<{ storyId: string }>();
  const storyId = parseStoryId(storyIdParam);
  const storyDetailQuery = useQuery({
    ...storyDetailQueryOptions(storyId ?? 0),
    enabled: storyId !== null,
  });

  return (
    <PageShell onTitleClick={() => navigate('/')} title="AIPIA News">
      {storyId === null ? (
        <Surface className="p-4 sm:p-6" elevated>
          <ErrorState
            message="The story route needs a positive numeric Hacker News story ID."
            title="Invalid story ID"
          />
        </Surface>
      ) : null}

      {storyId !== null && storyDetailQuery.isLoading ? (
        <Surface className="p-4 sm:p-6" elevated>
          <LoadingState label="Loading story detail..." />
        </Surface>
      ) : null}

      {storyId !== null && storyDetailQuery.isError ? (
        <Surface className="p-4 sm:p-6" elevated>
          <ErrorState
            action={
              <Button
                onClick={() => void storyDetailQuery.refetch()}
                variant="secondary"
              >
                Try again
              </Button>
            }
            message={getErrorMessage(storyDetailQuery.error)}
            title="Could not load story"
          />
        </Surface>
      ) : null}

      {storyId !== null &&
      storyDetailQuery.isSuccess &&
      storyDetailQuery.data === null ? (
        <Surface className="p-4 sm:p-6" elevated>
          <EmptyState
            message="This Hacker News item is deleted, dead, missing, or not a displayable story."
            title="Story unavailable"
          />
        </Surface>
      ) : null}

      {storyId !== null &&
      storyDetailQuery.isSuccess &&
      storyDetailQuery.data !== null ? (
        <StoryDetailPanel story={storyDetailQuery.data} />
      ) : null}
    </PageShell>
  );
}

export default StoryDetailPage;
