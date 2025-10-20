import { clearSession, readSession } from '@/features/auth/storage'
import type { AuthSession } from '@/features/auth/types'

type HeadersTuple = {
  headers: Headers
  session: AuthSession
}

const ensureValidSession = (): AuthSession => {
  const session = readSession()
  if (!session || !session.token) {
    throw new Error('Sessão inválida ou expirada.')
  }
  return session
}

export const buildAuthorizedHeaders = (initialHeaders?: HeadersInit): HeadersTuple => {
  const session = ensureValidSession()
  const headers = new Headers(initialHeaders ?? {})
  headers.set('Authorization', `Bearer ${session.token}`)
  return { headers, session }
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

export const apiFetch = async <TResponse>(
  input: RequestInfo | URL,
  options: ApiFetchOptions = {},
): Promise<TResponse> => {
  const { auth = true, headers, ...rest } = options
  const requestHeaders = new Headers(headers ?? {})

  if (auth) {
    try {
      const { headers: authorizedHeaders } = buildAuthorizedHeaders(requestHeaders)
      authorizedHeaders.forEach((value, key) => requestHeaders.set(key, value))
    } catch (error) {
      clearSession()
      throw error
    }
  }

  const response = await fetch(input, {
    ...rest,
    headers: requestHeaders,
  })

  if (!response.ok) {
    throw new Error(`Falha na requisição (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}
