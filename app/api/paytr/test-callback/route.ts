import { NextResponse } from 'next/server'
import { callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Development-only endpoint
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Sadece development.' }, { status: 403 })
  }

  try {
    // TODO: payment servisine testCallback metodu eklenecek
    return await callGateway('payment', 'testCallback', {}, 'test')
  } catch (error) {
    return errorResponse(error)
  }
}
