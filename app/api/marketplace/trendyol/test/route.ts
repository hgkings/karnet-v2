import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

// TODO: marketplace servisine testTrendyol metodu eklenecek
export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    return await callGateway('marketplace', 'testTrendyol', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
