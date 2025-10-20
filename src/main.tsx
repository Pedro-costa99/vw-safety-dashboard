import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/app/router'
import { queryClient } from '@/lib/query-client'
import '@/styles/globals.css'
import { AUTH_SESSION_QUERY_KEY } from '@/features/auth/constants'
import { readSession } from '@/features/auth/storage'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento #root não encontrado no documento.')
}

const existingSession = readSession()
if (existingSession) {
  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, existingSession)
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
