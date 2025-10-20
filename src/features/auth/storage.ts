import { AUTH_SESSION_STORAGE_KEY } from './constants'
import type { AuthSession } from './types'

const isExpired = (session: AuthSession | null) => {
  if (!session?.expiresAt) {
    return false
  }
  return session.expiresAt <= Date.now()
}

export const readSession = (): AuthSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (isExpired(parsed)) {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return null
  }
}

export const persistSession = (session: AuthSession) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export const clearSession = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}
