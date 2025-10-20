import { AUTH_ALLOWED_EMAILS, AUTH_FAKE_PASSWORD } from './constants'
import type { AuthCredentials, AuthSession } from './types'

const createToken = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const now = () => Date.now()

export const signInWithMock = async ({ email, password }: AuthCredentials): Promise<AuthSession> => {
  await new Promise((resolve) => setTimeout(resolve, 750))

  if (!AUTH_ALLOWED_EMAILS.includes(email.toLowerCase()) || password !== AUTH_FAKE_PASSWORD) {
    throw new Error('Credenciais inválidas. Use um e-mail autorizado e a senha mock.')
  }

  const issuedAt = now()
  const expiresAt = issuedAt + 1000 * 60 * 60 * 8

  return {
    token: createToken(),
    user: {
      id: email,
      name: email.startsWith('admin') ? 'Administrador VW' : 'Analista VW',
      email,
      role: email.startsWith('admin') ? 'admin' : 'viewer',
    },
    issuedAt,
    expiresAt,
  }
}
