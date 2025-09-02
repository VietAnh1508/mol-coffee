import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks'
import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) return false;
        }
        // Don't retry on permission/auth errors
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as { message: string }).message;
          if (message?.includes('permission') || 
              message?.includes('auth') || 
              message?.includes('not found')) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
})

function InnerApp() {
  const auth = useAuth()
  
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
