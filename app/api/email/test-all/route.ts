import { NextRequest, NextResponse } from 'next/server'
import { callGateway, errorResponse } from '@/lib/api/helpers'

/**
 * Tüm email template'lerini test eder.
 * POST /api/email/test-all
 * Body: { email: "test@example.com" }
 * Authorization: Bearer CRON_SECRET
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    // TODO: notification servisine testAllEmails metodu eklenecek
    return await callGateway('notification', 'testAllEmails', { email }, 'system')
  } catch (error) {
    return errorResponse(error)
  }
}
