import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    // TODO: payment servisine backfillProDates metodu eklenecek
    return await callGateway('payment', 'backfillProDates', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
