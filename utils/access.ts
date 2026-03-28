import type { User } from '@/types'
import type { PlanLimits } from '@/config/plans'
import { getPlanLimits } from '@/config/plans'

const PRO_PLANS = ['pro', 'pro_monthly', 'pro_yearly', 'admin']

export function isProUser(user: Pick<User, 'plan' | 'isPro' | 'proExpiresAt'>): boolean {
  if (!PRO_PLANS.includes(user.plan)) return false
  if (user.plan === 'admin') return true

  // proExpiresAt null → legacy pro, suresi yok
  if (!user.proExpiresAt) return true

  return new Date(user.proExpiresAt) > new Date()
}

export function isStarterUser(user: Pick<User, 'plan'>): boolean {
  return user.plan === 'starter' || user.plan === 'starter_monthly' || user.plan === 'starter_yearly'
}

export function canAccessFeature(
  user: Pick<User, 'plan'>,
  feature: keyof PlanLimits
): boolean {
  const limits = getPlanLimits(user.plan)
  const value = limits[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return false
}

export function getPlanLimit(user: Pick<User, 'plan'>): number {
  const limits = getPlanLimits(user.plan)
  return limits.maxProducts
}
