import { apiClient } from './client'

export const supportApi = {
  list: () => apiClient.get('/api/support/tickets'),
  getById: (id: string) => apiClient.get(`/api/support/tickets/${id}`),
  create: (data: unknown) => apiClient.post('/api/support/tickets', data),
}
