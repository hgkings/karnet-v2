import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin
    return callGateway('user', 'getProfile', { adminStats: true }, admin.id)
  } catch (error) { return errorResponse(error) }
}
