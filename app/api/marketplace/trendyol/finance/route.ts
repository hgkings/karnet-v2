import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

// TODO: marketplace servisine getTrendyolFinance metodu eklenecek
export async function GET(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const startDate =
      searchParams.get('startDate') ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') ?? new Date().toISOString().split('T')[0]

    return await callGateway('marketplace', 'getTrendyolFinance', { startDate, endDate }, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
