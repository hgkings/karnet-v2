// ----------------------------------------------------------------
// UserLogic — Katman 6
// Kullanici profil, plan kontrolu, tercihler.
// KNOWLEDGE-BASE.md Section 7 + 10.
// ----------------------------------------------------------------

import { ServiceError } from '@/lib/gateway/types'

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

export type PlanType = 'free' | 'starter' | 'pro' | 'pro_monthly' | 'pro_yearly' | 'starter_monthly' | 'starter_yearly' | 'admin'

const PRO_PLANS: PlanType[] = ['pro', 'pro_monthly', 'pro_yearly']

export interface PlanLimits {
  maxProducts: number
  maxMarketplaces: number
  csvExport: boolean
  jsonExport: boolean
  csvImport: boolean
  proAccounting: boolean
  sensitivityAnalysis: boolean
  breakevenCalc: boolean
  cashflowAnalysis: boolean
  marketplaceComparison: boolean
  apiIntegration: boolean
  pdfReportMonthly: number
  weeklyEmailReport: boolean
  prioritySupport: boolean
  competitorTracking: boolean
}

export const PLAN_LIMITS: Record<'free' | 'starter' | 'pro' | 'admin', PlanLimits> = {
  free: {
    maxProducts: 3,
    maxMarketplaces: 2,
    csvExport: false,
    jsonExport: false,
    csvImport: false,
    proAccounting: false,
    sensitivityAnalysis: false,
    breakevenCalc: false,
    cashflowAnalysis: false,
    marketplaceComparison: false,
    apiIntegration: false,
    pdfReportMonthly: 0,
    weeklyEmailReport: false,
    prioritySupport: false,
    competitorTracking: false,
  },
  starter: {
    maxProducts: 25,
    maxMarketplaces: 4,
    csvExport: true,
    jsonExport: true,
    csvImport: true,
    proAccounting: true,
    sensitivityAnalysis: true,
    breakevenCalc: true,
    cashflowAnalysis: false,
    marketplaceComparison: false,
    apiIntegration: false,
    pdfReportMonthly: 5,
    weeklyEmailReport: false,
    prioritySupport: false,
    competitorTracking: false,
  },
  pro: {
    maxProducts: Infinity,
    maxMarketplaces: Infinity,
    csvExport: true,
    jsonExport: true,
    csvImport: true,
    proAccounting: true,
    sensitivityAnalysis: true,
    breakevenCalc: true,
    cashflowAnalysis: true,
    marketplaceComparison: true,
    apiIntegration: true,
    pdfReportMonthly: Infinity,
    weeklyEmailReport: true,
    prioritySupport: true,
    competitorTracking: true,
  },
  admin: {
    maxProducts: Infinity,
    maxMarketplaces: Infinity,
    csvExport: true,
    jsonExport: true,
    csvImport: true,
    proAccounting: true,
    sensitivityAnalysis: true,
    breakevenCalc: true,
    cashflowAnalysis: true,
    marketplaceComparison: true,
    apiIntegration: true,
    pdfReportMonthly: Infinity,
    weeklyEmailReport: true,
    prioritySupport: true,
    competitorTracking: true,
  },
}

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  plan: PlanType
  isPro: boolean
  proStartedAt: string | null
  proExpiresAt: string | null
  proRenewal: boolean
  emailNotificationsEnabled: boolean
  emailWeeklyReport: boolean
  emailRiskAlert: boolean
  emailMarginAlert: boolean
  emailProExpiry: boolean
}

// ----------------------------------------------------------------
// Servis
// ----------------------------------------------------------------

export class UserLogic {
  /**
   * Kullanici profilini getirir.
   * FAZ5'te repository baglanacak.
   */
  async getProfile(
    _traceId: string,
    _payload: unknown,
    _userId: string
  ): Promise<UserProfile | null> {
    // TODO(FAZ5): userRepository.findById(userId)
    return null
  }

  /**
   * Profil gunceller.
   * FAZ5'te repository baglanacak.
   */
  async updateProfile(
    _traceId: string,
    _payload: unknown,
    _userId: string
  ): Promise<{ success: boolean }> {
    // TODO(FAZ5): userRepository.update(userId, updates)
    return { success: true }
  }

  /**
   * Plan limiti kontrol eder.
   * Analiz olusturmadan once cagrilir.
   */
  async checkPlanLimit(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number }> {
    const { plan, currentAnalysisCount } = payload as {
      plan: PlanType
      currentAnalysisCount: number
    }

    const limits = this.resolveLimits(plan)

    if (limits.maxProducts === Infinity) {
      return { allowed: true, currentCount: currentAnalysisCount, maxAllowed: Infinity }
    }

    if (currentAnalysisCount >= limits.maxProducts) {
      throw new ServiceError(
        `Plan limitinize ulaştınız. Maksimum ${limits.maxProducts} analiz oluşturabilirsiniz.`,
        { code: 'PLAN_LIMIT_REACHED', statusCode: 403, traceId }
      )
    }

    return {
      allowed: true,
      currentCount: currentAnalysisCount,
      maxAllowed: limits.maxProducts,
    }
  }

  /**
   * Pro kullanici mi kontrol eder.
   * KNOWLEDGE-BASE.md Section 7: isProUser() mantigi.
   */
  async isProUser(
    _traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ isPro: boolean }> {
    const { plan, proExpiresAt } = payload as {
      plan: PlanType
      proExpiresAt: string | null
    }

    if (!PRO_PLANS.includes(plan) && plan !== 'admin') {
      return { isPro: false }
    }

    // admin her zaman pro
    if (plan === 'admin') {
      return { isPro: true }
    }

    // proExpiresAt null ise — legacy pro, suresi yok
    if (!proExpiresAt) {
      return { isPro: true }
    }

    // Suresi dolmus mu?
    const expiresAt = new Date(proExpiresAt)
    if (expiresAt > new Date()) {
      return { isPro: true }
    }

    return { isPro: false }
  }

  /**
   * Plan icin limitleri cozumler.
   */
  resolveLimits(plan: PlanType): PlanLimits {
    if (plan === 'admin') return PLAN_LIMITS.admin
    if (PRO_PLANS.includes(plan)) return PLAN_LIMITS.pro
    if (plan === 'starter' || plan === 'starter_monthly' || plan === 'starter_yearly') return PLAN_LIMITS.starter
    return PLAN_LIMITS.free
  }

  /**
   * Kullanicinin belirli bir ozellige erisimi var mi kontrol eder.
   */
  async checkFeatureAccess(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ allowed: boolean }> {
    const { plan, feature } = payload as { plan: PlanType; feature: keyof PlanLimits }
    const limits = this.resolveLimits(plan)
    const value = limits[feature]

    if (typeof value === 'boolean') {
      if (!value) {
        throw new ServiceError('Bu özellik planınızda mevcut değil. Yükseltme yapın.', {
          code: 'FEATURE_NOT_AVAILABLE',
          statusCode: 403,
          traceId,
        })
      }
      return { allowed: true }
    }

    // Sayisal limit (0 ise erisim yok)
    if (value === 0) {
      throw new ServiceError('Bu özellik planınızda mevcut değil. Yükseltme yapın.', {
        code: 'FEATURE_NOT_AVAILABLE',
        statusCode: 403,
        traceId,
      })
    }

    return { allowed: true }
  }
}

export const userLogic = new UserLogic()
