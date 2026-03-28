import { apiClient } from './client'

export const notificationsApi = {
  list: () => apiClient.get('/api/notifications'),
  markAsRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/api/notifications/read-all'),
  checkRisk: (payload: unknown) => apiClient.post('/api/notifications', payload),
}
