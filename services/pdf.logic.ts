// ----------------------------------------------------------------
// PdfLogic — Katman 6
// PDF rapor uretimi + aylik limit kontrolu.
// KNOWLEDGE-BASE.md Section 14.
// v1 hata duzeltmesi: Aylik PDF limiti server-side uygula.
// ----------------------------------------------------------------

import { ServiceError } from '@/lib/gateway/types'
import { userLogic } from './user.logic'
import type { PlanType } from './user.logic'

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

export interface GenerateReportPayload {
  analysisId: string
  plan: PlanType
}

export interface PdfReportResult {
  reportId: string
  generatedAt: string
}

// ----------------------------------------------------------------
// Servis
// ----------------------------------------------------------------

export class PdfLogic {
  /**
   * Aylik PDF indirme limitini kontrol eder.
   * v1 hata duzeltmesi: Bu kontrol artik server-side (v1'de sadece client-side vardi).
   */
  async checkMonthlyLimit(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ allowed: boolean; used: number; limit: number }> {
    const { plan } = payload as { plan: PlanType }

    const limits = userLogic.resolveLimits(plan)
    const monthlyLimit = limits.pdfReportMonthly

    // Sinirsiz plan
    if (monthlyLimit === Infinity) {
      return { allowed: true, used: 0, limit: Infinity }
    }

    // Limiti 0 olan planlar (free)
    if (monthlyLimit === 0) {
      throw new ServiceError('PDF rapor indirmek için planınızı yükseltin.', {
        code: 'PDF_NOT_AVAILABLE',
        statusCode: 403,
        traceId,
      })
    }

    // TODO(FAZ5): pdfDownloadRepository.getMonthlyCount(userId, currentMonth)
    const usedThisMonth = 0 // FAZ5'te DB'den gelecek

    if (usedThisMonth >= monthlyLimit) {
      throw new ServiceError(
        `Bu ay ${monthlyLimit} PDF indirme hakkınızı kullandınız. Gelecek ay yenilenir.`,
        { code: 'PDF_LIMIT_REACHED', statusCode: 403, traceId }
      )
    }

    return { allowed: true, used: usedThisMonth, limit: monthlyLimit }
  }

  /**
   * Analiz PDF raporu uretir.
   * FAZ5'te: analiz verisini DB'den cek, hesapla, PDF olustur.
   */
  async generateReport(
    traceId: string,
    payload: unknown,
    userId: string
  ): Promise<PdfReportResult> {
    const input = payload as GenerateReportPayload

    if (!input.analysisId) {
      throw new ServiceError('Analiz ID\'si zorunludur', {
        code: 'MISSING_ANALYSIS_ID',
        statusCode: 400,
        traceId,
      })
    }

    // Aylik limit kontrolu
    await this.checkMonthlyLimit(traceId, { plan: input.plan }, userId)

    // TODO(FAZ5): analysisRepository.findById(analysisId, userId)
    // TODO(FAZ5): Analiz verisinden hesaplamalari yeniden calistir
    // TODO(FAZ5): pdf-lib ile PDF olustur (A4, summary cards, maliyet tablosu, donut chart)
    // TODO(FAZ5): pdfDownloadRepository.increment(userId, currentMonth)

    const reportId = `KNR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    return {
      reportId,
      generatedAt: new Date().toISOString(),
    }
  }
}

export const pdfLogic = new PdfLogic()
