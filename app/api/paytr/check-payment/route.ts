import { NextRequest } from 'next/server'
import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  try {
    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'paymentId gerekli' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // TODO: payment servisine checkPayment metodu eklenecek
    return await callGateway('payment', 'checkPayment', { paymentId }, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
