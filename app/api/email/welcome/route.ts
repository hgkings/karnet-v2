import { NextRequest, NextResponse } from 'next/server'
import { callGateway, errorResponse } from '@/lib/api/helpers'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // TODO: notification servisine sendWelcome metodu eklenecek
    return await callGateway('notification', 'sendWelcome', { userId, email }, userId)
  } catch (error) {
    return errorResponse(error)
  }
}
