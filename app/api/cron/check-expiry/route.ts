import { requireCronSecret, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET(request: Request) {
  try {
    const denied = requireCronSecret(request)
    if (denied) return denied

    // Pro suresi dolan kullanicilari kontrol et + email gonder
    return callGateway('user', 'getProfile', { cronCheckExpiry: true }, 'system')
  } catch (error) { return errorResponse(error) }
}
