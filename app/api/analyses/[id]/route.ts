import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'
import { AnalysisUpdateSchema } from '@/lib/validators/schemas/analysis.schema'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    const { id } = await params
    return callGateway('analysis', 'getById', { id }, user.id)
  } catch (error) { return errorResponse(error) }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    const { id } = await params

    const body = await request.json()
    const parsed = AnalysisUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz güncelleme verisi.' },
        { status: 400 }
      )
    }

    return callGateway('analysis', 'fullAnalysis', parsed.data, user.id)
    void id
  } catch (error) { return errorResponse(error) }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    const { id } = await params
    return callGateway('analysis', 'delete', { id }, user.id)
  } catch (error) { return errorResponse(error) }
}
