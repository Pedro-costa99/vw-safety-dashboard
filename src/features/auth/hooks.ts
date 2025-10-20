import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AUTH_SESSION_QUERY_KEY } from './constants'
import { signInWithMock } from './service'
import { clearSession, persistSession, readSession } from './storage'
import type { AuthCredentials, AuthSession } from './types'

export const useAuthSession = () => {
  const queryClient = useQueryClient()

  const sessionQuery = useQuery<AuthSession | null>({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: async () => readSession(),
    initialData: () => readSession(),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const session = sessionQuery.data
    if (!session?.expiresAt) {
      return
    }
    const timeUntilExpiry = session.expiresAt - Date.now()
    if (timeUntilExpiry <= 0) {
      clearSession()
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null)
      return
    }
    const handle = window.setTimeout(() => {
      clearSession()
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null)
    }, Math.min(timeUntilExpiry, 2_147_483_647))

    return () => window.clearTimeout(handle)
  }, [sessionQuery.data, queryClient])

  return sessionQuery
}

export const useSignIn = () => {
  const queryClient = useQueryClient()
  return useMutation<AuthSession, Error, AuthCredentials>({
    mutationFn: signInWithMock,
    onSuccess: (session) => {
      persistSession(session)
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, session)
    },
  })
}

export const useSignOut = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      clearSession()
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null)
    },
  })
}
