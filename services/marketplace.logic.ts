// ----------------------------------------------------------------
// MarketplaceLogic — Katman 6
// Trendyol / Hepsiburada baglanti yonetimi ve sync.
// KNOWLEDGE-BASE.md Section 3.
// DB islemleri FAZ5'te repository + DBHelper baglanacak.
// ----------------------------------------------------------------

import { ServiceError } from '@/lib/gateway/types'

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
  /**
   * Marketplace baglantisi kurar.
   * Credentials AES-256-GCM ile sifrelenir (DBHelper).
   * FAZ5'te repository + DBHelper baglanacak.
   */
  async connect(
    traceId: string,
    payload: unknown,
    _userId: string
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

    // TODO(FAZ5): DBHelper.encrypt(credentials)
    // TODO(FAZ5): marketplaceRepository.createConnection(userId, marketplace, encrypted)
    // TODO(FAZ5): marketplaceSecretsRepository.store(connectionId, encryptedSecrets)

    return { connectionId: 'placeholder', status: 'pending_test' }
  }

  /**
   * Marketplace baglantisini keser.
   * FAZ5'te repository baglanacak.
   */
  async disconnect(
    _traceId: string,
    _payload: unknown,
    _userId: string
  ): Promise<{ success: boolean }> {
    // TODO(FAZ5): marketplaceRepository.deleteConnection(connectionId, userId)
    // Cascade delete: marketplace_secrets da silinir
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
    const { marketplace, connectionId } = payload as {
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

    // TODO(FAZ5): DBHelper.decrypt(secrets)
    // TODO(FAZ5): Trendyol/HB API'ye test istegi at
    // TODO(FAZ5): Basarili ise connection.status = 'connected', basarisiz ise 'error'

    void marketplace // kullanilacak
    return { success: true, storeName: null }
  }

  /**
   * Marketplace urunlerini ceker.
   * FAZ5'te Trendyol/HB API client baglanacak.
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

    // TODO(FAZ5): DBHelper.decrypt(secrets)
    // TODO(FAZ5): Fetch products from Trendyol/HB API
    // TODO(FAZ5): Normalize + match to existing analyses
    // TODO(FAZ5): Update marketplace_sync_logs

    return { productsCount: 0 }
  }

  /**
   * Marketplace siparislerini ceker.
   * FAZ5'te Trendyol/HB API client baglanacak.
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

    // TODO(FAZ5): DBHelper.decrypt(secrets)
    // TODO(FAZ5): Fetch orders from API (13-day windowing for Trendyol)
    // TODO(FAZ5): Aggregate product_sales_metrics
    // TODO(FAZ5): Update last_sync_at

    return { ordersCount: 0 }
  }

  /**
   * Baglanti durumunu dondurur.
   * FAZ5'te repository baglanacak.
   */
  async getStatus(
    _traceId: string,
    _payload: unknown,
    _userId: string
  ): Promise<MarketplaceConnection[]> {
    // TODO(FAZ5): marketplaceRepository.getConnectionsByUserId(userId)
    return []
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

export const marketplaceLogic = new MarketplaceLogic()
