// ----------------------------------------------------------------
// PaymentRepository — Katman 8
// 🔒 KORUNAN DOSYA — Hilmi onayi olmadan degistirilemez.
// Tablo: payments
// Minimal iskelet — FAZ8'de doldurulacak.
// ----------------------------------------------------------------

import { BaseRepository } from './base.repository'
import type { PaymentRow } from '@/lib/db/types'

export class PaymentRepository extends BaseRepository<PaymentRow> {
  protected tableName = 'payments'

  async findByUserId(userId: string): Promise<PaymentRow[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Odemeler getirilemedi: ${error.message}`)
    }

    return (data ?? []) as PaymentRow[]
  }

  // FAZ8'de eklenecek:
  // - createPayment()
  // - updatePaymentAndProfile() — atomic transaction
  // - findByToken()
  // - findByProviderOrderId()
}
