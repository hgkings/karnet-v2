import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

// TODO: marketplace servisine getTrendyolUnsuppliedOrders metodu eklenecek
export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    return await callGateway('marketplace', 'getTrendyolUnsuppliedOrders', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
