import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export async function PATCH() {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    return callGateway('notification', 'markAllAsRead', {}, user.id)
  } catch (error) { return errorResponse(error) }
}
