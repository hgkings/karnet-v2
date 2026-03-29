import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function POST() {
  // Debug-only endpoint — block in production
  if (process.env.VERCEL_ENV === 'production') {
    return new Response(
      JSON.stringify({ error: 'Bu endpoint production ortamında devre dışıdır.' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  try {
    // TODO: notification servisine testEmail metodu eklenecek
    return await callGateway('notification', 'testEmail', {}, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
