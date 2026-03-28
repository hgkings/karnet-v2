// ----------------------------------------------------------------
// 🔒 KORUNAN DOSYA — PayTR odeme olusturma.
// POST: Plan secimi → PayTR Link API → paymentUrl dondur.
// ----------------------------------------------------------------

import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'
import { z } from 'zod'

const CreatePaymentSchema = z.object({
  planId: z.enum(['starter_monthly', 'starter_yearly', 'pro_monthly', 'pro_yearly']),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    const parsed = CreatePaymentSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz plan seçimi.' },
        { status: 400 }
      )
    }

    return callGateway('payment', 'createPayment', {
      planId: parsed.data.planId,
      userEmail: user.email,
    }, user.id)
  } catch (error) {
    return errorResponse(error)
  }
}
