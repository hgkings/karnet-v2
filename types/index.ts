// ----------------------------------------------------------------
// Paylasilan TypeScript tipleri — UI katmani kullanir.
// DATABASE-SCHEMA.md ile eslesen yapilar.
// ----------------------------------------------------------------

export type PlanType =
  | 'free'
  | 'starter'
  | 'starter_monthly'
  | 'starter_yearly'
  | 'pro'
  | 'pro_monthly'
  | 'pro_yearly'
  | 'admin'

export type MarketplaceName = 'trendyol' | 'hepsiburada' | 'n11' | 'amazon_tr' | 'custom'

export type RiskLevel = 'safe' | 'moderate' | 'risky' | 'dangerous'

export type TicketStatus = 'acik' | 'inceleniyor' | 'cevaplandi' | 'kapali'
export type TicketPriority = 'dusuk' | 'normal' | 'yuksek' | 'acil'
export type TicketCategory = 'teknik' | 'odeme' | 'hesap' | 'oneri' | 'diger'

export interface User {
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
  targetMargin: number | null
  defaultMarketplace: string | null
}

export interface Analysis {
  id: string
  userId: string
  marketplace: MarketplaceName
  productName: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  riskScore: number
  riskLevel: RiskLevel
  createdAt: string
  competitorPrice: number | null
  competitorName: string | null
}

export interface Ticket {
  id: string
  userId: string
  userEmail: string | null
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  message: string
  adminReply: string | null
  adminRepliedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'danger' | 'warning' | 'info'
  category: string
  title: string
  message: string
  isRead: boolean
  href: string | null
  createdAt: string
}

export interface MarketplaceConnection {
  id: string
  marketplace: MarketplaceName
  status: 'disconnected' | 'pending_test' | 'connected' | 'error'
  storeName: string | null
  sellerId: string | null
  lastSyncAt: string | null
  webhookActive: boolean
}
