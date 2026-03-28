// ----------------------------------------------------------------
// API Route Yardimcilari
// Auth, hata yonetimi, IP cikartma — tum route'lar kullanir.
// ----------------------------------------------------------------

import { createClient } from '@/lib/supabase/server'
import { gateway } from '@/lib/gateway/gateway.adapter'
import { initializeServices } from '@/services/registry'
import type { GatewayResponse, ServiceName } from '@/lib/gateway/types'
import type { RateLimitType } from '@/lib/security/rate-limit'

// Servisleri baslat (idempotent)
initializeServices()

export interface AuthenticatedUser {
  id: string
  email: string
}

/**
 * Request'ten authenticated user dondurur. Yoksa null.
 */
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { id: user.id, email: user.email ?? '' }
}

/**
 * Auth zorunlu — user yoksa 401 Response dondurur.
 */
export async function requireAuth(): Promise<AuthenticatedUser | Response> {
  const user = await getAuthUser()
  if (!user) {
    return Response.json(
      { success: false, error: 'Giriş yapmanız gerekiyor.' },
      { status: 401 }
    )
  }
  return user
}

/**
 * Admin kontrolu — plan=admin degilse 403 Response dondurur.
 */
export async function requireAdmin(): Promise<AuthenticatedUser | Response> {
  const result = await requireAuth()
  if (result instanceof Response) return result

  const profileResult = await gateway.handle<{ plan: string }>(
    'user',
    'getProfile',
    {},
    result.id
  )

  if (!profileResult.success || (profileResult.data as { plan: string } | null)?.plan !== 'admin') {
    return Response.json(
      { success: false, error: 'Yetkisiz erişim.' },
      { status: 403 }
    )
  }

  return result
}

/**
 * CRON_SECRET header kontrolu.
 */
export function requireCronSecret(request: Request): Response | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      { success: false, error: 'Yetkisiz.' },
      { status: 401 }
    )
  }
  return null
}

/**
 * Gateway'i cagirir ve standart Response dondurur.
 */
export async function callGateway<T = unknown>(
  serviceName: ServiceName,
  method: string,
  payload: unknown,
  userId: string,
  options?: { rateLimitType?: RateLimitType; rateLimitIdentifier?: string }
): Promise<Response> {
  const result: GatewayResponse<T> = await gateway.handle<T>(
    serviceName,
    method,
    payload,
    userId,
    options
  )

  if (!result.success) {
    return Response.json(
      { success: false, error: result.error, traceId: result.traceId },
      { status: 400 }
    )
  }

  return Response.json({
    success: true,
    data: result.data,
    traceId: result.traceId,
  })
}

/**
 * Hata yakalayici wrapper.
 */
export function errorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Bir hata oluştu.'
  return Response.json(
    { success: false, error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
    { status: 500 }
  )
  // Not: message loglama icin kullanilir, client'a gonderilmez
  void message
}

/**
 * Request'ten IP adresini cikarir.
 */
export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
