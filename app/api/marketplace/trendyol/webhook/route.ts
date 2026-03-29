import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

/**
 * Trendyol Webhook Receiver
 *
 * Trendyol bu endpoint'e sipariş/iade olaylarını POST atar.
 * Kullanıcı oturumu yoktur — sellerId ile kullanıcı bulunur.
 * Her durumda 200 döner (Trendyol 200 almazsa tekrar gönderir).
 *
 * TRENDYOL_WEBHOOK_SECRET env var ayarlıysa HMAC-SHA256 imzası doğrulanır.
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.TRENDYOL_WEBHOOK_SECRET
    const signature = request.headers.get('x-signature')

    const body = await request.text()

    // İmza doğrulama (secret tanımlıysa)
    if (webhookSecret) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (!signature || signature !== expectedSig) {
        return NextResponse.json({ error: 'Geçersiz imza' }, { status: 401 })
      }
    }

    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(body) as Record<string, unknown>
    } catch {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // TODO: marketplace servisine handleTrendyolWebhook metodu eklenecek
    await callGateway('marketplace', 'handleTrendyolWebhook', payload, 'webhook')
  } catch {
    // Hata olsa bile 200 dön — Trendyol 200 almazsa tekrar gönderir
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
