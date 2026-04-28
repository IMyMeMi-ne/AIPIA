import { Link, createBrowserRouter } from 'react-router-dom'
import NewsListPage from '../pages/news-list/NewsListPage.tsx'
import StoryDetailPage from '../pages/story-detail/StoryDetailPage.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { PageShell } from '../shared/ui/PageShell.tsx'
import { Surface } from '../shared/ui/Surface.tsx'

const notFoundElement = (
  <PageShell description="The requested route does not exist." title="Page not found">
    <Surface className="p-4 sm:p-6" elevated>
      <ErrorState
        action={
          <Link
            className="inline-flex min-h-10 items-center rounded-(--ds-radius-control) bg-(--ds-color-accent) px-4 text-sm font-semibold text-(--ds-color-accent-foreground) transition-colors hover:bg-(--ds-color-accent-hover)"
            to="/"
          >
            Back to stories
          </Link>
        }
        message="Check the address or return to the main page."
        title="Route unavailable"
      />
    </Surface>
  </PageShell>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <NewsListPage />,
  },
  {
    path: '/stories/:storyId',
    element: <StoryDetailPage />,
  },
  {
    path: '*',
    element: notFoundElement,
  },
])

export default router
