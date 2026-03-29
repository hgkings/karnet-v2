import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

// TODO: marketplace servisine syncTrendyolOrders metodu eklenecek
export async function POST(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    let body: { startDate?: string; endDate?: string } = {}
    try {
      body = await request.json()
    } catch {
      // Body yoksa veya parse edilemiyorsa boş obje kullan
    }

    return await callGateway(
      'marketplace',
      'syncTrendyolOrders',
      { startDate: body.startDate, endDate: body.endDate },
      auth.id
    )
  } catch (error) {
    return errorResponse(error)
  }
}
