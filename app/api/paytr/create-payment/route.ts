// ----------------------------------------------------------------
// 🔒 KORUNAN DOSYA — PayTR odeme olusturma.
// POST: Plan secimi → PayTR Link API → paymentUrl dondur.
// ----------------------------------------------------------------

import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'
import { z } from 'zod'

const CreatePaymentSchema = z.object({
  planId: z.enum(['starter_monthly', 'starter_yearly', 'pro_monthly', 'pro_yearly', 'test_1tl']),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    console.log('[create-payment] request body:', JSON.stringify(body))

    const parsed = CreatePaymentSchema.safeParse(body)
    if (!parsed.success) {
      console.error('[create-payment] validation failed:', JSON.stringify(parsed.error.flatten()))
      return Response.json(
        { success: false, error: 'Geçersiz plan seçimi.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    console.log('[create-payment] validated planId:', parsed.data.planId, 'user:', user.id)

    const result = await callGateway('payment', 'createPayment', {
      planId: parsed.data.planId,
      userEmail: user.email,
    }, user.id)

    console.log('[create-payment] gateway response status:', result.status)
    return result
  } catch (error) {
    console.error('[create-payment] unhandled error:', error instanceof Error ? error.message : error)
    return errorResponse(error)
  }
}
