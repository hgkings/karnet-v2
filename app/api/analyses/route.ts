import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'
import { AnalysisInputSchema } from '@/lib/validators/schemas/analysis.schema'

export async function GET() {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    return callGateway('analysis', 'list', {}, user.id)
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    const parsed = AnalysisInputSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz analiz verisi.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    return callGateway('analysis', 'create', { input: parsed.data }, user.id)
  } catch (error) { return errorResponse(error) }
}
