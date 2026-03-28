import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    const { id } = await params

    // PDF servisi aylik limiti kontrol eder + rapor uretir
    return callGateway('pdf', 'generateReport', { analysisId: id }, user.id)
  } catch (error) { return errorResponse(error) }
}
