import { Link, createBrowserRouter } from 'react-router-dom'
import NewsListPage from '../pages/news-list/NewsListPage.tsx'
import StoryDetailPage from '../pages/story-detail/StoryDetailPage.tsx'

const notFoundElement = (
  <main className="flex min-h-screen bg-app-background text-app-foreground flex-col items-center justify-center gap-3 px-8 py-10 text-center" aria-labelledby="not-found-title">
    <p className="m-0 text-base text-app-muted">AIPIA News</p>
    <h1 id="not-found-title" className="m-0 text-5xl leading-none font-bold tracking-[-0.06em] text-app-foreground sm:text-7xl">
      Page not found
    </h1>
    <p className="m-0 text-base text-app-muted">The requested route does not exist.</p>
    <Link className="font-bold text-app-foreground underline-offset-4 hover:underline" to="/">
      Back to stories
    </Link>
  </main>
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
