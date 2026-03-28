import { requireCronSecret, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET(request: Request) {
  try {
    const denied = requireCronSecret(request)
    if (denied) return denied

    // Haftalik rapor emaili gonder
    return callGateway('notification', 'list', { cronWeeklyReport: true }, 'system')
  } catch (error) { return errorResponse(error) }
}
