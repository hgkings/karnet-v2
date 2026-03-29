import { NextRequest } from 'next/server'
import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  try {
    const { analysisId } = await req.json()

    if (!analysisId) {
      return new Response(JSON.stringify({ error: 'Missing analysisId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // TODO: notification servisine checkRisk metodu eklenecek
    return await callGateway('notification', 'checkRisk', { analysisId }, auth.id)
  } catch (error) {
    return errorResponse(error)
  }
}
