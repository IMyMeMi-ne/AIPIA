import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import NewsListPage from '../pages/news-list/NewsListPage.tsx'
import NotFoundPage from '../pages/not-found/NotFoundPage.tsx'
import StoryDetailPage from '../pages/story-detail/StoryDetailPage.tsx'

export const appRoutes = [
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
] satisfies RouteObject[]

const router = createBrowserRouter(appRoutes)

export default router
