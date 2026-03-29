import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

/**
 * Key rotation endpoint — Admin only.
 * Re-encrypts all marketplace_secrets with the current MARKETPLACE_SECRET_KEY.
 * Use when rotating the encryption key:
 *   1. Set new MARKETPLACE_SECRET_KEY env var
 *   2. Keep old key temporarily as MARKETPLACE_SECRET_KEY_OLD
 *   3. Call this endpoint to re-encrypt
 *   4. Remove MARKETPLACE_SECRET_KEY_OLD
 */
export async function POST() {
  const admin = await requireAdmin()
  if (admin instanceof Response) return admin

  try {
    // TODO: marketplace servisine rotateKeys metodu eklenecek
    return await callGateway('marketplace', 'rotateKeys', {}, admin.id)
  } catch (error) {
    return errorResponse(error)
  }
}
