import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET() {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    return callGateway('notification', 'list', {}, user.id)
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    return callGateway('notification', 'checkRiskAlert', body, user.id)
  } catch (error) { return errorResponse(error) }
}
