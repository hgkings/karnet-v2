// ----------------------------------------------------------------
// PaymentLogic — Katman 6
// 🔒 KORUNAN DOSYA — Hilmi onayi olmadan degistirilemez.
// PayTR entegrasyonu: hash uretimi/dogrulama, token, plan yonetimi.
// KNOWLEDGE-BASE.md Section 5 ile birebir.
// ----------------------------------------------------------------

import { createHmac, randomBytes } from 'crypto'
import { ServiceError } from '@/lib/gateway/types'
import type { PaymentRepository } from '@/repositories/payment.repository'

// ----------------------------------------------------------------
// Sabitler
// ----------------------------------------------------------------

export interface PlanConfig {
  id: string
  name: string
  plan: string
  isPro: boolean
  amountTry: number
  durationDays: number
}

const PLANS: Record<string, PlanConfig> = {
  starter_monthly: {
    id: 'starter_monthly',
    name: 'Starter Aylık',
    plan: 'starter',
    isPro: false,
    amountTry: 399,
    durationDays: 30,
  },
  starter_yearly: {
    id: 'starter_yearly',
    name: 'Starter Yıllık',
    plan: 'starter',
    isPro: false,
    amountTry: 3990,
    durationDays: 365,
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Aylık',
    plan: 'pro',
    isPro: true,
    amountTry: 799,
    durationDays: 30,
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Yıllık',
    plan: 'pro',
    isPro: true,
    amountTry: 7990,
    durationDays: 365,
  },
  test_1tl: {
    id: 'test_1tl',
    name: 'Test Planı',
    plan: 'pro',
    isPro: true,
    amountTry: 1,
    durationDays: 1,
  },
}

const TOKEN_EXPIRY_MINUTES = 15
const TOKEN_BYTES = 48 // 96 hex karakter

// ----------------------------------------------------------------
// Yardimcilar
// ----------------------------------------------------------------

function getMerchantId(): string {
  const v = process.env.PAYTR_MERCHANT_ID
  if (!v) throw new Error('PAYTR_MERCHANT_ID tanimlanmamis')
  return v
}

function getMerchantKey(): string {
  const v = process.env.PAYTR_MERCHANT_KEY
  if (!v) throw new Error('PAYTR_MERCHANT_KEY tanimlanmamis')
  return v
}

function getMerchantSalt(): string {
  const v = process.env.PAYTR_MERCHANT_SALT
  if (!v) throw new Error('PAYTR_MERCHANT_SALT tanimlanmamis')
  return v
}

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex')
}

function generateMerchantOid(): string {
  return `KNT-${Date.now()}-${randomBytes(4).toString('hex')}`
}

/**
 * PayTR callback hash dogrulama.
 * HMAC-SHA256(callback_id + merchant_oid + salt + status + total_amount, key) → base64
 */
function verifyCallbackHash(
  callbackId: string,
  merchantOid: string,
  status: string,
  totalAmount: string,
  receivedHash: string
): boolean {
  const data = callbackId + merchantOid + getMerchantSalt() + status + totalAmount
  const expectedHash = createHmac('sha256', getMerchantKey())
    .update(data)
    .digest('base64')
  return expectedHash === receivedHash
}

// ----------------------------------------------------------------
// Servis
// ----------------------------------------------------------------

export class PaymentLogic {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  /**
   * Odeme olusturur — PayTR Link API'ye token ister.
   */
  async createPayment(
    traceId: string,
    payload: unknown,
    userId: string
  ): Promise<{ paymentId: string; paymentUrl: string; token: string }> {
    const { planId, userEmail } = payload as { planId: string; userEmail: string }

    console.log('[payment.createPayment] START', { planId, userEmail, userId, traceId })
    console.log('[payment.createPayment] env check:', {
      PAYTR_MERCHANT_ID: !!process.env.PAYTR_MERCHANT_ID,
      PAYTR_MERCHANT_KEY: !!process.env.PAYTR_MERCHANT_KEY,
      PAYTR_MERCHANT_SALT: !!process.env.PAYTR_MERCHANT_SALT,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '(not set)',
    })
    console.log('[payment.createPayment] available plans:', Object.keys(PLANS))

    const planConfig = PLANS[planId]
    console.log('[payment.createPayment] planConfig for', planId, ':', planConfig ?? 'NOT FOUND')

    if (!planConfig) {
      console.error('[payment.createPayment] FAIL: plan not found in PLANS map for planId:', planId)
      throw new ServiceError('Geçersiz plan seçimi', {
        code: 'INVALID_PLAN',
        statusCode: 400,
        traceId,
      })
    }

    const token = generateToken()
    const merchantOid = generateMerchantOid()
    const tokenExpiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString()

    console.log('[payment.createPayment] creating DB record...', { merchantOid, amountTry: planConfig.amountTry })

    // DB'ye odeme kaydi olustur
    const payment = await this.paymentRepo.createPayment({
      user_id: userId,
      plan: planConfig.id,
      amount_try: planConfig.amountTry,
      provider_order_id: merchantOid,
      token,
      token_expires_at: tokenExpiresAt,
      email: userEmail,
    })

    console.log('[payment.createPayment] DB record created:', payment.id)

    // PayTR Link API'ye istek at
    const merchantId = getMerchantId()
    const merchantKey = getMerchantKey()
    const merchantSalt = getMerchantSalt()

    console.log('[payment.createPayment] PayTR credentials loaded, calling Link API...')

    const amountKurus = planConfig.amountTry * 100 // TL → kurus
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.xn--krnet-3qa.com'}/api/paytr/callback`

    // PayTR hash: merchant_id + merchant_oid + amount + salt
    const hashStr = `${merchantId}${merchantOid}${amountKurus}${merchantSalt}`
    const paytrToken = createHmac('sha256', merchantKey)
      .update(hashStr)
      .digest('base64')

    // PayTR Link API
    const paytrBody = new URLSearchParams({
      merchant_id: merchantId,
      merchant_oid: merchantOid,
      email: userEmail,
      payment_amount: String(amountKurus),
      paytr_token: paytrToken,
      currency: 'TL',
      merchant_ok_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/billing?paymentId=${payment.id}&token=${token}`,
      merchant_fail_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/billing?error=payment_failed`,
      callback_link: callbackUrl,
      lang: 'tr',
      payment_type: 'link',
    })

    console.log('[payment.createPayment] PayTR request URL: https://www.paytr.com/odeme/api/link/create')
    console.log('[payment.createPayment] PayTR request params (no secrets):', {
      merchant_oid: merchantOid,
      email: userEmail,
      payment_amount: String(amountKurus),
      currency: 'TL',
      callback_link: callbackUrl,
    })

    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/link/create', {
      method: 'POST',
      body: paytrBody,
    })

    const paytrResult = await paytrResponse.json() as { status: string; link?: string; reason?: string }

    console.log('[payment.createPayment] PayTR response:', { status: paytrResult.status, hasLink: !!paytrResult.link, reason: paytrResult.reason })

    if (paytrResult.status !== 'success' || !paytrResult.link) {
      console.error('[payment.createPayment] FAIL: PayTR rejected:', paytrResult)
      throw new ServiceError('Ödeme bağlantısı oluşturulamadı. Lütfen tekrar deneyin.', {
        code: 'PAYTR_LINK_FAILED',
        statusCode: 502,
        traceId,
      })
    }

    console.log('[payment.createPayment] SUCCESS — paymentUrl received')

    return {
      paymentId: payment.id,
      paymentUrl: paytrResult.link,
      token,
    }
  }

  /**
   * PayTR callback isler — hash dogrula, atomic DB update.
   * Idempotent: ayni provider_order_id icin tekrar cagrilirsa atlar.
   */
  async handleCallback(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ processed: boolean }> {
    const body = payload as Record<string, string>

    const merchantOid = body.merchant_oid ?? ''
    const status = body.status ?? ''
    const totalAmount = body.total_amount ?? ''
    const hash = body.hash ?? ''
    const callbackId = body.callback_id ?? body.id ?? ''

    // Hash dogrulama — KRITIK
    if (!verifyCallbackHash(callbackId, merchantOid, status, totalAmount, hash)) {
      throw new ServiceError('Hash dogrulama basarisiz', {
        code: 'INVALID_HASH',
        statusCode: 403,
        traceId,
      })
    }

    // Odemeyi bul
    const payment = await this.paymentRepo.findByProviderOrderId(merchantOid)
    if (!payment) {
      throw new ServiceError('Odeme bulunamadi', {
        code: 'PAYMENT_NOT_FOUND',
        statusCode: 404,
        traceId,
      })
    }

    // Idempotency: zaten islenmis mi?
    if (payment.status === 'paid') {
      return { processed: true }
    }

    // Basarisiz odeme
    if (status !== 'success') {
      await this.paymentRepo.update(payment.id, {
        status: 'failed',
        raw_payload: body as unknown as Record<string, unknown>,
      } as Partial<{ id: string; status: string; raw_payload: Record<string, unknown> }>)
      return { processed: true }
    }

    // Basarili odeme — plan hesapla
    const planConfig = PLANS[payment.plan]
    if (!planConfig) {
      throw new ServiceError('Gecersiz plan', {
        code: 'INVALID_PLAN_CONFIG',
        statusCode: 500,
        traceId,
      })
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000)

    // ATOMIC guncelleme: payments + profiles
    await this.paymentRepo.updatePaymentAndProfile(
      payment.id,
      payment.user_id,
      {
        status: 'paid',
        paid_at: now.toISOString(),
        provider_order_id: merchantOid,
        raw_payload: body as unknown as Record<string, unknown>,
      },
      {
        plan: planConfig.plan,
        is_pro: planConfig.isPro,
        plan_type: planConfig.id,
        pro_started_at: now.toISOString(),
        pro_expires_at: expiresAt.toISOString(),
        pro_renewal: false,
      }
    )

    return { processed: true }
  }

  /**
   * Odeme dogrulama — UI tarafından polling.
   * Token + user_id eslesmeli, suresi gecmemis, status = 'paid'.
   */
  async verifyPayment(
    traceId: string,
    payload: unknown,
    userId: string
  ): Promise<{ verified: boolean; plan?: string }> {
    const { token } = payload as { token: string }

    if (!token) {
      throw new ServiceError('Token zorunludur', {
        code: 'MISSING_TOKEN',
        statusCode: 400,
        traceId,
      })
    }

    const payment = await this.paymentRepo.findByToken(token)
    if (!payment) {
      return { verified: false }
    }

    // Token kullaniciya ait mi?
    if (payment.user_id !== userId) {
      return { verified: false }
    }

    // Token suresi gecmis mi?
    if (payment.token_expires_at && new Date(payment.token_expires_at) < new Date()) {
      return { verified: false }
    }

    // Odeme basarili mi?
    if (payment.status !== 'paid') {
      return { verified: false }
    }

    const planConfig = PLANS[payment.plan]
    return {
      verified: true,
      plan: planConfig?.name ?? payment.plan,
    }
  }

  /**
   * Plan listesini dondurur.
   */
  async getPlans(
    _traceId: string,
    _payload: unknown,
    _userId: string
  ): Promise<PlanConfig[]> {
    return Object.values(PLANS)
  }
}

// Instance olusturma registry.ts'de yapilir (repo DI)
