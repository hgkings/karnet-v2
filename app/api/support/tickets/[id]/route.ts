import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    const { id } = await params
    return callGateway('support', 'getTicket', { ticketId: id }, user.id)
  } catch (error) { return errorResponse(error) }
}
