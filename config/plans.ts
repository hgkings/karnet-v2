import type { PlanType } from '@/types'

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
  },
}

export const PLAN_NAMES: Record<string, string> = {
  free: 'Ücretsiz',
  starter: 'Starter',
  starter_monthly: 'Starter (Aylık)',
  starter_yearly: 'Starter (Yıllık)',
  pro: 'Pro',
  pro_monthly: 'Pro (Aylık)',
  pro_yearly: 'Pro (Yıllık)',
  admin: 'Admin',
}

const PRO_PLANS: PlanType[] = ['pro', 'pro_monthly', 'pro_yearly']

export function resolvePlanTier(plan: PlanType): 'free' | 'starter' | 'pro' | 'admin' {
  if (plan === 'admin') return 'admin'
  if (PRO_PLANS.includes(plan)) return 'pro'
  if (plan === 'starter' || (plan as string) === 'starter_monthly' || (plan as string) === 'starter_yearly') return 'starter'
  return 'free'
}

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[resolvePlanTier(plan)]
}
