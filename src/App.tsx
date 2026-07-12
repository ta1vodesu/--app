import { RouterProvider } from 'react-router-dom'
import { router } from '@/router/routes'
import { AuthProvider } from '@/context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  )
}

export default App
