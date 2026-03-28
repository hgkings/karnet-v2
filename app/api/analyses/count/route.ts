import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET() {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    return callGateway('analysis', 'list', { countOnly: true }, user.id)
  } catch (error) { return errorResponse(error) }
}
