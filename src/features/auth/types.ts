export type AuthCredentials = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'viewer'
}

export type AuthSession = {
  token: string
  user: AuthUser
  issuedAt: number
  expiresAt: number
}
