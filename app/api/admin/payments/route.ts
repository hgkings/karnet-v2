import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') ?? '1', 10)

    return callGateway('payment' as 'user', 'getProfile', {
      adminPayments: true,
      status: status ?? undefined,
      page,
    }, admin.id)
    // Not: payment servisi FAZ8'de, simdilik user uzerinden placeholder
  } catch (error) { return errorResponse(error) }
}
