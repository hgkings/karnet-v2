// TODO: marketplace servisine getHepsiburadaFinance metodu eklenecek
import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const gun = Number(searchParams.get('gun') ?? 30)

    return await callGateway('marketplace', 'getHepsiburadaFinance', { gun }, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
