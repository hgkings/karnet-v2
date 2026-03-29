// TODO: marketplace servisine normalizeHepsiburadaOrders metodu eklenecek
import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    return await callGateway('marketplace', 'normalizeHepsiburadaOrders', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
