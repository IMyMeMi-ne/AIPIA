import { RouterProvider } from 'react-router-dom'
import QueryProvider from './providers/QueryProvider.tsx'
import router from './router.tsx'

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}

export default App
