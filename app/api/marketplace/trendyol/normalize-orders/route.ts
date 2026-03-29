import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

// TODO: marketplace servisine normalizeTrendyolOrders metodu eklenecek
export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    return await callGateway('marketplace', 'normalizeTrendyolOrders', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
