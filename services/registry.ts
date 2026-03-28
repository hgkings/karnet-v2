// ----------------------------------------------------------------
// Service Registry — Tum servisleri ServiceBridge'e kaydeder.
// API route'lar baslamadan once initializeServices() cagrilmali.
// payment.logic.ts 🔒 — FAZ8'e ait, burada kaydedilmez.
// ----------------------------------------------------------------

import { serviceBridge } from '@/lib/gateway/service.bridge'
import type { LogicService } from '@/lib/gateway/types'

import { analysisLogic } from './analysis.logic'
import { riskLogic } from './risk.logic'
import { commissionLogic } from './commission.logic'
import { userLogic } from './user.logic'
import { marketplaceLogic } from './marketplace.logic'
import { notificationLogic } from './notification.logic'
import { supportLogic } from './support.logic'
import { pdfLogic } from './pdf.logic'
import { blogLogic } from './blog.logic'

let initialized = false

/**
 * Tum servisleri ServiceBridge'e kaydeder.
 * Idempotent — birden fazla cagri guvenlidir.
 */
export function initializeServices(): void {
  if (initialized) return

  serviceBridge.register('analysis', analysisLogic as unknown as LogicService)
  serviceBridge.register('risk', riskLogic as unknown as LogicService)
  serviceBridge.register('commission', commissionLogic as unknown as LogicService)
  serviceBridge.register('user', userLogic as unknown as LogicService)
  serviceBridge.register('marketplace', marketplaceLogic as unknown as LogicService)
  serviceBridge.register('notification', notificationLogic as unknown as LogicService)
  serviceBridge.register('support', supportLogic as unknown as LogicService)
  serviceBridge.register('pdf', pdfLogic as unknown as LogicService)
  serviceBridge.register('blog', blogLogic as unknown as LogicService)

  // payment servisi FAZ8'de eklenecek (🔒 korunan)

  initialized = true
}
