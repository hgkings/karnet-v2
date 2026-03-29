// TODO: marketplace servisine testHepsiburadaConnection metodu eklenecek
import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    return await callGateway('marketplace', 'testHepsiburadaConnection', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
