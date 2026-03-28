import { requireCronSecret, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET(request: Request) {
  try {
    const denied = requireCronSecret(request)
    if (denied) return denied

    // Tum aktif marketplace baglantilari icin sync calistir
    return callGateway('marketplace', 'fullSync', { cronTriggered: true }, 'system')
  } catch (error) { return errorResponse(error) }
}
