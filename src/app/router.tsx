import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import NewsListPage from '../pages/news-list/NewsListPage.tsx'
import { RouteChunkErrorState, RouteChunkFallback } from './RouteChunkStates.tsx'

async function loadStoryDetailRoute() {
  const { default: StoryDetailPage } = await import(
    '../pages/story-detail/StoryDetailPage.tsx'
  )

  return { Component: StoryDetailPage }
}

async function loadNotFoundRoute() {
  const { default: NotFoundPage } = await import(
    '../pages/not-found/NotFoundPage.tsx'
  )

  return { Component: NotFoundPage }
}

export const appRoutes = [
  {
    path: '/',
    element: <NewsListPage />,
  },
  {
    path: '/stories/:storyId',
    errorElement: <RouteChunkErrorState />,
    hydrateFallbackElement: <RouteChunkFallback />,
    lazy: loadStoryDetailRoute,
  },
  {
    path: '*',
    errorElement: <RouteChunkErrorState />,
    hydrateFallbackElement: <RouteChunkFallback />,
    lazy: loadNotFoundRoute,
  },
] satisfies RouteObject[]

const router = createBrowserRouter(appRoutes)

export default router
