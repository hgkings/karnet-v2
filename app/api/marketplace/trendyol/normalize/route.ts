import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

// TODO: marketplace servisine normalizeTrendyol metodu eklenecek
export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    return await callGateway('marketplace', 'normalizeTrendyol', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
