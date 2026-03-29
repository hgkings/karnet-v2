import { NextRequest } from 'next/server'
import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Block in production
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return new Response(
      JSON.stringify({ error: 'Bu endpoint production ortamında devre dışıdır.' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const admin = await requireAdmin()
  if (admin instanceof Response) return admin

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (!userId && !email) {
      return new Response(
        JSON.stringify({ error: 'Pass ?userId=xxx or ?email=xxx' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // TODO: user servisine getSubscriptionDebug metodu eklenecek
    return await callGateway('user', 'getSubscriptionDebug', { userId, email }, admin.id)
  } catch (error) {
    return errorResponse(error)
  }
}
