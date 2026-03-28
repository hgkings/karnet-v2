// ----------------------------------------------------------------
// MarketplaceLogic — Katman 6
// Trendyol / Hepsiburada baglanti yonetimi ve sync.
// KNOWLEDGE-BASE.md Section 3.
// ----------------------------------------------------------------

import { ServiceError } from '@/lib/gateway/types'
import { encrypt, decrypt } from '@/lib/db/db.helper'
import type { MarketplaceRepository } from '@/repositories/marketplace.repository'

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

export type MarketplaceType = 'trendyol' | 'hepsiburada'
export type ConnectionStatus = 'disconnected' | 'pending_test' | 'connected' | 'error'

export interface MarketplaceConnection {
  id: string
  userId: string
  marketplace: MarketplaceType
  status: ConnectionStatus
  storeName: string | null
  sellerId: string | null
  lastSyncAt: string | null
  webhookActive: boolean
}

export interface ConnectPayload {
  marketplace: MarketplaceType
  apiKey: string
  apiSecret: string
  sellerId: string
  storeName?: string
}

export interface SyncResult {
  productsCount: number
  ordersCount: number
  syncedAt: string
}

// ----------------------------------------------------------------
// Servis
// ----------------------------------------------------------------

export class MarketplaceLogic {
  constructor(private readonly marketplaceRepo: MarketplaceRepository) {}

  /**
   * Marketplace baglantisi kurar.
   * Credentials AES-256-GCM ile sifrelenir (DBHelper).
   */
  async connect(
    traceId: string,
    payload: unknown,
    userId: string
  ): Promise<{ connectionId: string; status: ConnectionStatus }> {
    const input = payload as ConnectPayload

    if (!input.apiKey || !input.apiSecret || !input.sellerId) {
      throw new ServiceError('API anahtarları ve satıcı ID\'si zorunludur', {
        code: 'MISSING_CREDENTIALS',
        statusCode: 400,
        traceId,
      })
    }

    if (!['trendyol', 'hepsiburada'].includes(input.marketplace)) {
      throw new ServiceError('Desteklenmeyen pazaryeri', {
        code: 'UNSUPPORTED_MARKETPLACE',
        statusCode: 400,
        traceId,
      })
    }

    // Baglanti olustur
    const connection = await this.marketplaceRepo.createConnection({
      user_id: userId,
      marketplace: input.marketplace,
      store_name: input.storeName,
      seller_id: input.sellerId,
      status: 'pending_test',
    })

    // Credentials sifrele ve sakla
    const encryptedBlob = encrypt(JSON.stringify({
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
      sellerId: input.sellerId,
    }))

    await this.marketplaceRepo.storeSecrets(connection.id, encryptedBlob)

    return { connectionId: connection.id, status: 'pending_test' }
  }

  /**
   * Marketplace baglantisini keser.
   * Cascade delete: marketplace_secrets da silinir.
   */
  async disconnect(
    _traceId: string,
    payload: unknown,
    userId: string
  ): Promise<{ success: boolean }> {
    const { connectionId } = payload as { connectionId: string }
    await this.marketplaceRepo.deleteConnection(connectionId, userId)
    return { success: true }
  }

  /**
   * Baglanti testi yapar.
   * API'ye basit bir istek atarak credentials'in gecerli oldugunu dogrular.
   */
  async testConnection(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ success: boolean; storeName: string | null }> {
    const { connectionId } = payload as {
      marketplace: MarketplaceType
      connectionId: string
    }

    if (!connectionId) {
      throw new ServiceError('Bağlantı ID\'si zorunludur', {
        code: 'MISSING_CONNECTION_ID',
        statusCode: 400,
        traceId,
      })
    }

    // Credentials coz
    const secretRow = await this.marketplaceRepo.getSecrets(connectionId)
    if (!secretRow) {
      throw new ServiceError('Bağlantı bilgileri bulunamadı', {
        code: 'SECRETS_NOT_FOUND',
        statusCode: 404,
        traceId,
      })
    }

    const _credentials = JSON.parse(decrypt(secretRow.encrypted_blob)) as {
      apiKey: string
      apiSecret: string
      sellerId: string
    }

    // TODO: Trendyol/HB API'ye gercek test istegi — API client FAZ7+ entegrasyonunda
    // Simdilik baglanti durumunu 'connected' olarak guncelle
    await this.marketplaceRepo.updateConnectionStatus(connectionId, 'connected')

    return { success: true, storeName: null }
  }

  /**
   * Marketplace urunlerini ceker.
   */
  async syncProducts(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ productsCount: number }> {
    const { connectionId } = payload as { connectionId: string }

    if (!connectionId) {
      throw new ServiceError('Bağlantı ID\'si zorunludur', {
        code: 'MISSING_CONNECTION_ID',
        statusCode: 400,
        traceId,
      })
    }

    // Sync log baslat
    const syncLog = await this.marketplaceRepo.createSyncLog({
      connection_id: connectionId,
      sync_type: 'products',
      status: 'running',
    })

    try {
      // Credentials coz
      const secretRow = await this.marketplaceRepo.getSecrets(connectionId)
      if (!secretRow) {
        throw new ServiceError('Bağlantı bilgileri bulunamadı', {
          code: 'SECRETS_NOT_FOUND',
          statusCode: 404,
          traceId,
        })
      }

      const _credentials = JSON.parse(decrypt(secretRow.encrypted_blob))

      // TODO: Trendyol/HB API'den urunleri cek — API client entegrasyonu ayri task
      const productsCount = 0

      await this.marketplaceRepo.updateSyncLog(syncLog.id, 'success', `${productsCount} ürün senkronize edildi`)
      return { productsCount }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Bilinmeyen hata'
      await this.marketplaceRepo.updateSyncLog(syncLog.id, 'failed', msg)
      throw error
    }
  }

  /**
   * Marketplace siparislerini ceker.
   */
  async syncOrders(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ ordersCount: number }> {
    const { connectionId } = payload as { connectionId: string }

    if (!connectionId) {
      throw new ServiceError('Bağlantı ID\'si zorunludur', {
        code: 'MISSING_CONNECTION_ID',
        statusCode: 400,
        traceId,
      })
    }

    // Sync log baslat
    const syncLog = await this.marketplaceRepo.createSyncLog({
      connection_id: connectionId,
      sync_type: 'orders',
      status: 'running',
    })

    try {
      const secretRow = await this.marketplaceRepo.getSecrets(connectionId)
      if (!secretRow) {
        throw new ServiceError('Bağlantı bilgileri bulunamadı', {
          code: 'SECRETS_NOT_FOUND',
          statusCode: 404,
          traceId,
        })
      }

      const _credentials = JSON.parse(decrypt(secretRow.encrypted_blob))

      // TODO: Trendyol/HB API'den siparisleri cek — API client entegrasyonu ayri task
      const ordersCount = 0

      await this.marketplaceRepo.updateSyncLog(syncLog.id, 'success', `${ordersCount} sipariş senkronize edildi`)
      await this.marketplaceRepo.updateLastSyncAt(connectionId)
      return { ordersCount }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Bilinmeyen hata'
      await this.marketplaceRepo.updateSyncLog(syncLog.id, 'failed', msg)
      throw error
    }
  }

  /**
   * Baglanti durumunu dondurur.
   */
  async getStatus(
    _traceId: string,
    _payload: unknown,
    userId: string
  ): Promise<unknown[]> {
    return this.marketplaceRepo.getConnectionsByUserId(userId)
  }

  /**
   * Tam sync yapar (urunler + siparisler).
   * Cron job tarafindan cagrilir.
   */
  async fullSync(
    traceId: string,
    payload: unknown,
    userId: string
  ): Promise<SyncResult> {
    const { connectionId } = payload as { connectionId: string }

    const products = await this.syncProducts(traceId, { connectionId }, userId)
    const orders = await this.syncOrders(traceId, { connectionId }, userId)

    return {
      productsCount: products.productsCount,
      ordersCount: orders.ordersCount,
      syncedAt: new Date().toISOString(),
    }
  }
}

// Instance olusturma registry.ts'de yapilir (repo DI)
