import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/shared/theme/index.ts'
import QueryProvider from './providers/QueryProvider.tsx'
import router from './router.tsx'

function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </ThemeProvider>
  )
}

export default App
