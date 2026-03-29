import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

// TODO: marketplace servisine registerTrendyolWebhook metodu eklenecek
export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    return await callGateway('marketplace', 'registerTrendyolWebhook', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
