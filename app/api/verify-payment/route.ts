// ----------------------------------------------------------------
// 🔒 KORUNAN DOSYA — Odeme dogrulama.
// GET: UI tarafindan polling (5 saniyede bir, max 10 dk).
// Token + user_id eslesmeli, suresi gecmemis, status = 'paid'.
// ----------------------------------------------------------------

import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return Response.json(
        { success: false, error: 'Token zorunludur.' },
        { status: 400 }
      )
    }

    return callGateway('payment', 'verifyPayment', { token }, user.id)
  } catch (error) {
    return errorResponse(error)
  }
}
