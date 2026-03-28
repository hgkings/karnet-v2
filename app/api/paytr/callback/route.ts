// ----------------------------------------------------------------
// 🔒 KORUNAN DOSYA — PayTR callback (webhook).
// POST: PayTR odeme sonrasi buraya POST atar.
// Auth YOKTUR — PayTR kimliksiz erisim gerektirir.
// proxy.ts'de /api/paytr/* zaten bypass edilir.
// ----------------------------------------------------------------

import { callGateway } from '@/lib/api/helpers'

export async function POST(request: Request) {
  try {
    // PayTR form-urlencoded gonderir
    const formData = await request.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = String(value)
    })

    // Auth YOK — PayTR callback kimliksiz gelir
    // Gateway uzerinden payment.handleCallback cagir
    const result = await callGateway(
      'payment',
      'handleCallback',
      body,
      'paytr-callback' // system user — auth bypass
    )

    // PayTR "OK" yaniti bekler
    if (result.status === 200) {
      return new Response('OK', { status: 200 })
    }

    return new Response('OK', { status: 200 })
  } catch {
    // PayTR'a her zaman 200 dondur — hata loglandi, tekrar denemesini engelle
    return new Response('OK', { status: 200 })
  }
}
