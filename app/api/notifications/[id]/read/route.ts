import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    const { id } = await params
    return callGateway('notification', 'markAsRead', { notificationId: id }, user.id)
  } catch (error) { return errorResponse(error) }
}
