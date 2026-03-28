import { requireAdmin, errorResponse } from '@/lib/api/helpers'
import { ActivatePaymentSchema } from '@/lib/validators/schemas/payment.schema'

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const body = await request.json()
    const parsed = ActivatePaymentSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz ödeme ID.' },
        { status: 400 }
      )
    }

    // FAZ8'de payment servisi uzerinden gateway cagrilacak
    // Simdilik placeholder response
    return Response.json({
      success: false,
      error: 'Ödeme aktivasyonu henüz uygulanmadı (FAZ8).',
    }, { status: 501 })

    void parsed.data
  } catch (error) { return errorResponse(error) }
}
