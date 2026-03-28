import { apiClient } from './client'

export const analysesApi = {
  list: () => apiClient.get('/api/analyses'),
  getById: (id: string) => apiClient.get(`/api/analyses/${id}`),
  create: (input: unknown) => apiClient.post('/api/analyses', input),
  update: (id: string, input: unknown) => apiClient.patch(`/api/analyses/${id}`, input),
  delete: (id: string) => apiClient.del(`/api/analyses/${id}`),
  count: () => apiClient.get('/api/analyses/count'),
}
