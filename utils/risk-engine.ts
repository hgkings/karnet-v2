import type { RiskLevel } from '@/types'

export interface RiskLevelConfig {
  label: string
  bgColor: string
  textColor: string
  borderColor: string
}

export const RISK_LEVEL_CONFIG: Record<RiskLevel, RiskLevelConfig> = {
  safe: {
    label: 'Güvenli',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  moderate: {
    label: 'Orta',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
  },
  risky: {
    label: 'Riskli',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
  },
  dangerous: {
    label: 'Tehlikeli',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
  },
}

export function getRiskConfig(level: RiskLevel): RiskLevelConfig {
  return RISK_LEVEL_CONFIG[level]
}

export function getRiskLabel(level: RiskLevel): string {
  return RISK_LEVEL_CONFIG[level].label
}
