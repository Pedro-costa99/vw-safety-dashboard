import { apiFetch } from '@/lib/api/http'

type MockProtectedItem = {
  id: string
  message: string
  createdAt: string
}

export type MockProtectedResponse = {
  items: MockProtectedItem[]
  requestedAt: string
}

export const getMockProtectedResource = async (): Promise<MockProtectedResponse> => {
  return apiFetch<MockProtectedResponse>('/api/protected/mock', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
