import { apiClient } from './client'

export const marketplaceApi = {
  trendyol: {
    getStatus: () => apiClient.get('/api/marketplace/trendyol'),
    connect: (data: unknown) => apiClient.post('/api/marketplace/trendyol', data),
    disconnect: (connectionId: string) => apiClient.del('/api/marketplace/trendyol', { connectionId }),
  },
  hepsiburada: {
    getStatus: () => apiClient.get('/api/marketplace/hepsiburada'),
    connect: (data: unknown) => apiClient.post('/api/marketplace/hepsiburada', data),
    disconnect: (connectionId: string) => apiClient.del('/api/marketplace/hepsiburada', { connectionId }),
  },
}
