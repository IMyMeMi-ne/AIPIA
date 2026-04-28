import { createBrowserRouter } from 'react-router-dom'
import NewsListPage from '../pages/news-list/NewsListPage.tsx'
import NotFoundPage from '../pages/not-found/NotFoundPage.tsx'
import StoryDetailPage from '../pages/story-detail/StoryDetailPage.tsx'

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
    element: <NotFoundPage />,
  },
])

export default router
