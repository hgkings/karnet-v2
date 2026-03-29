"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Store,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Package,
  ShoppingCart,
  Plug,
  Wand2,
  Link2,
  BarChart3,
  ChevronsUpDown,
  Check,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ─── Types ────────────────────────────────────────────────────────────────────

type MarketplaceKey = "trendyol" | "hepsiburada"
type ConnectionStatus = "disconnected" | "connected" | "pending_test" | "error"
type DisplayStatus = ConnectionStatus | "missing_info"

interface ConnectionState {
  connected: boolean
  connection_id?: string
  status: ConnectionStatus
  store_name?: string
  seller_id?: string
  last_sync_at?: string
  webhook_active?: boolean
}

interface FinansData {
  toplamKomisyon: number
  toplamHakedis: number
  toplamAlacak: number
  toplamBorc: number
  kayitSayisi: number
}

interface OrderMetrics {
  currentMonthSales: number
  unmatchedOrders: number
  metricsUpdated: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MARKETPLACE_CONFIG: Record<
  MarketplaceKey,
  {
    label: string
    color: string
    gradient: string
    iconBg: string
    apiKeyLabel: string
    apiKeyPlaceholder: string
    apiSecretLabel: string
    apiSecretPlaceholder: string
    sellerIdLabel: string
    helpText: string
    sellerIdErrorText: string
    description: string
    testCredentials: { apiKey: string; apiSecret: string; sellerId: string }
  }
> = {
  trendyol: {
    label: "Trendyol",
    color: "orange",
    gradient: "from-orange-50/50 to-transparent dark:from-orange-950/20",
    iconBg: "bg-orange-500 shadow-orange-500/20",
    apiKeyLabel: "API Key",
    apiKeyPlaceholder: "API Key giriniz",
    apiSecretLabel: "API Secret",
    apiSecretPlaceholder: "API Secret giriniz",
    sellerIdLabel: "Satıcı ID",
    helpText:
      "Trendyol Satıcı Paneli → Entegrasyon → API Bilgileri sayfasından API Key, API Secret ve Satıcı ID bilgilerinizi alabilirsiniz.",
    sellerIdErrorText:
      "Satıcı ID zorunludur. Trendyol Satıcı Paneli → Hesabım → Mağaza Bilgileri'nden bulabilirsiniz.",
    description: "Türkiye'nin en büyük pazaryeri",
    testCredentials: { apiKey: "TRENDYOL_TEST", apiSecret: "TRENDYOL_SECRET", sellerId: "123456" },
  },
  hepsiburada: {
    label: "Hepsiburada",
    color: "purple",
    gradient: "from-purple-50/50 to-transparent dark:from-purple-950/20",
    iconBg: "bg-purple-600 shadow-purple-600/20",
    apiKeyLabel: "Kullanıcı Adı",
    apiKeyPlaceholder: "Merchant kullanıcı adınız",
    apiSecretLabel: "Şifre",
    apiSecretPlaceholder: "Merchant şifreniz",
    sellerIdLabel: "Merchant ID",
    helpText:
      "Hepsiburada Satıcı Paneli → Hesap Bilgileri → Entegrasyon Bilgileri sayfasından kullanıcı adı, şifre ve Merchant ID bilgilerinizi alabilirsiniz.",
    sellerIdErrorText:
      "Merchant ID zorunludur. Hepsiburada Satıcı Paneli → Hesap Bilgileri → Entegrasyon Bilgileri'nden bulabilirsiniz.",
    description: "Yüksek hacimli satıcı pazaryeri",
    testCredentials: { apiKey: "HB_TEST", apiSecret: "HB_PASSWORD", sellerId: "HB_MOCK_123" },
  },
}

const STATUS_CONFIG: Record<DisplayStatus, { icon: React.ReactNode; label: string; color: string }> = {
  connected: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    label: "Bağlı",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  disconnected: {
    icon: <XCircle className="h-5 w-5" />,
    label: "Bağlı Değil",
    color: "text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)]",
  },
  pending_test: {
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
    label: "Test Ediliyor",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  error: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Hata",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  missing_info: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Eksik Bilgi",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceKey>("trendyol")
  const [marketplaceOpen, setMarketplaceOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [connection, setConnection] = useState<ConnectionState | null>(null)

  // Sync states
  const [testing, setTesting] = useState(false)
  const [syncingProducts, setSyncingProducts] = useState(false)
  const [syncingOrders, setSyncingOrders] = useState(false)
  const [normalizing, setNormalizing] = useState(false)
  const [normalizingOrders, setNormalizingOrders] = useState(false)
  const [lastLog, setLastLog] = useState<string | null>(null)
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics | null>(null)
  const [webhookKuruluyor, setWebhookKuruluyor] = useState(false)
  const [askidakiSiparis, setAskidakiSiparis] = useState(0)

  // Finance card
  const [finansData, setFinansData] = useState<FinansData | null>(null)
  const [finansYukleniyor, setFinansYukleniyor] = useState(false)
  const [finansHata, setFinansHata] = useState<string | null>(null)
  const [seciliAralik, setSeciliAralik] = useState<"7" | "30" | "90">("30")

  // Commission
  const [komisyonYukleniyor, setKomisyonYukleniyor] = useState(false)
  const [komisyonSonucu, setKomisyonSonucu] = useState<{ oran: number } | null>(null)

  // Form fields
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [sellerId, setSellerId] = useState("")
  const [storeName, setStoreName] = useState("")
  const [sellerIdError, setSellerIdError] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)

  const mpConfig = MARKETPLACE_CONFIG[selectedMarketplace]
  const apiBase = `/api/marketplace/${selectedMarketplace}`

  // ─── Fetch Status ────────────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(apiBase)
      if (res.ok) {
        const data = await res.json() as ConnectionState
        setConnection(data)
      } else {
        setConnection(null)
      }
    } catch {
      setConnection(null)
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    setLoading(true)
    setConnection(null)
    setLastLog(null)
    setOrderMetrics(null)
    setFinansData(null)
    setKomisyonSonucu(null)
    void fetchStatus()
  }, [fetchStatus])

  // ─── Finance data (Trendyol only) ───────────────────────────────────────────

  const finansVerisiniGetir = useCallback(async (gun: string) => {
    setFinansYukleniyor(true)
    setFinansHata(null)
    try {
      const bugun = new Date()
      const baslangic = new Date()
      baslangic.setDate(bugun.getDate() - Number(gun))
      const startDate = baslangic.toISOString().split("T")[0]
      const endDate = bugun.toISOString().split("T")[0]

      const res = await fetch(
        `/api/marketplace/trendyol/finance?startDate=${startDate}&endDate=${endDate}`
      )
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? "Finans verisi alınamadı")
      }
      const { data } = await res.json() as {
        data: Array<{
          komisyonTutari?: number
          saticiHakedis?: number
          alacak?: number
          borc?: number
        }>
      }
      const toplamlar = data.reduce(
        (acc, item) => ({
          toplamKomisyon: acc.toplamKomisyon + (item.komisyonTutari ?? 0),
          toplamHakedis: acc.toplamHakedis + (item.saticiHakedis ?? 0),
          toplamAlacak: acc.toplamAlacak + (item.alacak ?? 0),
          toplamBorc: acc.toplamBorc + (item.borc ?? 0),
        }),
        { toplamKomisyon: 0, toplamHakedis: 0, toplamAlacak: 0, toplamBorc: 0 }
      )
      setFinansData({ ...toplamlar, kayitSayisi: data.length })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Finans verisi alınamadı."
      setFinansHata(message)
    } finally {
      setFinansYukleniyor(false)
    }
  }, [])

  useEffect(() => {
    if (
      connection?.status === "connected" &&
      connection?.seller_id &&
      selectedMarketplace === "trendyol"
    ) {
      void finansVerisiniGetir(seciliAralik)
    }
  }, [connection, seciliAralik, selectedMarketplace, finansVerisiniGetir])

  // ─── Unsupplied orders (Trendyol only) ──────────────────────────────────────

  useEffect(() => {
    if (connection?.status === "connected" && selectedMarketplace === "trendyol") {
      fetch("/api/marketplace/trendyol/unsupplied-orders")
        .then((r) => r.json())
        .then((data: { toplam?: number }) => {
          if (typeof data.toplam === "number") setAskidakiSiparis(data.toplam)
        })
        .catch(() => undefined)
    } else {
      setAskidakiSiparis(0)
    }
  }, [connection, selectedMarketplace])

  // ─── Error translation ───────────────────────────────────────────────────────

  function translateConnectionError(status: number, message?: string): string {
    if (status === 401) return "API bilgileri hatalı, lütfen kontrol edin."
    if (status === 403) return "Bu hesabın API erişimi yok."
    if (status === 429) return "İstek limiti aşıldı, lütfen bekleyip tekrar deneyin."
    if (
      message?.toLowerCase().includes("timeout") ||
      message?.toLowerCase().includes("zaman aşım")
    ) {
      return "Bağlantı zaman aşımına uğradı, tekrar deneyin."
    }
    return message ?? "Bağlantı testi başarısız."
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error(`${mpConfig.apiKeyLabel} ve ${mpConfig.apiSecretLabel} zorunludur.`)
      return
    }
    if (!sellerId.trim()) {
      setSellerIdError("Satıcı ID zorunludur.")
      toast.error(mpConfig.sellerIdErrorText)
      return
    }
    setSellerIdError("")
    setSaving(true)
    setLastLog(null)
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          sellerId: sellerId.trim(),
          storeName: storeName.trim() || undefined,
        }),
      })
      const data = await res.json() as {
        success?: boolean
        secrets_saved?: boolean
        error_code?: string
        error?: string
        debug?: { pg_code?: string; pg_message?: string }
      }

      if (res.ok && data.success && data.secrets_saved) {
        toast.success(`${mpConfig.label} bağlantısı ve güvenli anahtarlar başarıyla kaydedildi!`)
        setLastLog("Bağlantı ve anahtarlar kaydedildi.")
        setApiKey("")
        setApiSecret("")
        setSellerId("")
        setStoreName("")
        void fetchStatus()
      } else if (res.ok && data.success && !data.secrets_saved) {
        toast.warning("Bağlantı oluşturuldu ancak güvenli anahtar kaydı doğrulanamadı. Tekrar deneyin.")
        setLastLog("Anahtar doğrulama başarısız.")
        void fetchStatus()
      } else {
        const codeMap: Record<string, string> = {
          secrets_write_failed: "Güvenli anahtar kaydı başarısız.",
          secrets_verify_failed: "Anahtar yazılmış gibi görünüyor ama doğrulanamadı.",
          encryption_key_missing: "Sunucu şifreleme anahtarı ayarlanmamış.",
          service_role_missing: "Servis anahtarı ayarlanmamış.",
          encryption_failed: "Şifreleme başarısız — anahtar formatı hatalı olabilir.",
          connection_upsert_failed: "Bağlantı kaydı oluşturulamadı.",
        }
        const friendlyMsg = (data.error_code ? codeMap[data.error_code] : undefined) ?? data.error ?? "Bilinmeyen hata."
        toast.error(friendlyMsg)
        setLastLog(`Hata: ${friendlyMsg}`)
      }
    } catch {
      toast.error("Sunucu hatası oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      const res = await fetch(apiBase, { method: "DELETE" })
      const data = await res.json() as { success?: boolean; error?: string }
      if (res.ok && data.success) {
        toast.success(`${mpConfig.label} bağlantısı kaldırıldı.`)
        void fetchStatus()
      } else {
        toast.error(data.error ?? "Bağlantı kaldırılamadı.")
      }
    } catch {
      toast.error("Sunucu hatası oluştu.")
    } finally {
      setDisconnecting(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setLastLog(null)
    try {
      const res = await fetch(`${apiBase}/test`, { method: "POST" })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }
      if (data.success) {
        toast.success(data.message ?? "Bağlantı başarılı!")
        setLastLog(data.message ?? null)
      } else {
        const friendlyMsg = translateConnectionError(res.status, data.message ?? data.error)
        toast.error(friendlyMsg)
        setLastLog(data.message ?? data.error ?? null)
      }
      void fetchStatus()
    } catch {
      toast.error("Bağlantı testi sırasında hata oluştu.")
    } finally {
      setTesting(false)
    }
  }

  const handleSyncProducts = async () => {
    setSyncingProducts(true)
    setLastLog(null)
    try {
      const res = await fetch(`${apiBase}/sync-products`, { method: "POST" })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }
      if (data.success) {
        toast.success(data.message ?? "Ürünler senkronize edildi!")
        setLastLog(data.message ?? null)
      } else {
        toast.error(data.error ?? "Ürün senkronizasyonu başarısız.")
        setLastLog(data.error ?? null)
      }
      void fetchStatus()
    } catch {
      toast.error("Ürün senkronizasyonu sırasında hata oluştu.")
    } finally {
      setSyncingProducts(false)
    }
  }

  const handleSyncOrders = async () => {
    setSyncingOrders(true)
    setLastLog(null)
    try {
      const res = await fetch(`${apiBase}/sync-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }
      if (data.success) {
        toast.success(data.message ?? "Siparişler senkronize edildi!")
        setLastLog(data.message ?? null)
      } else {
        toast.error(data.error ?? "Sipariş senkronizasyonu başarısız.")
        setLastLog(data.error ?? null)
      }
      void fetchStatus()
    } catch {
      toast.error("Sipariş senkronizasyonu sırasında hata oluştu.")
    } finally {
      setSyncingOrders(false)
    }
  }

  const handleNormalize = async () => {
    setNormalizing(true)
    setLastLog(null)
    try {
      const res = await fetch(`${apiBase}/normalize`, { method: "POST" })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }
      if (data.success) {
        toast.success(data.message ?? "Veriler normalize edildi!")
        setLastLog(data.message ?? null)
      } else {
        toast.error(data.error ?? "Normalizasyon başarısız.")
        setLastLog(data.error ?? null)
      }
      void fetchStatus()
    } catch {
      toast.error("Normalizasyon sırasında hata oluştu.")
    } finally {
      setNormalizing(false)
    }
  }

  const handleNormalizeOrders = async () => {
    setNormalizingOrders(true)
    setLastLog(null)
    try {
      const res = await fetch(`${apiBase}/normalize-orders`, { method: "POST" })
      const data = await res.json() as {
        success?: boolean
        message?: string
        error?: string
        currentMonthSales?: number
        unmatchedOrders?: number
        metricsUpdated?: number
      }
      if (data.success) {
        toast.success(data.message ?? "Sipariş metrikleri güncellendi!")
        setLastLog(data.message ?? null)
        setOrderMetrics({
          currentMonthSales: data.currentMonthSales ?? 0,
          unmatchedOrders: data.unmatchedOrders ?? 0,
          metricsUpdated: data.metricsUpdated ?? 0,
        })
      } else {
        toast.error(data.error ?? "Sipariş normalizasyonu başarısız.")
        setLastLog(data.error ?? null)
      }
      void fetchStatus()
    } catch {
      toast.error("Sipariş normalizasyonu sırasında hata oluştu.")
    } finally {
      setNormalizingOrders(false)
    }
  }

  const handleWebhookKur = async () => {
    setWebhookKuruluyor(true)
    try {
      const res = await fetch("/api/marketplace/trendyol/webhook-register", { method: "POST" })
      const data = await res.json() as { success?: boolean; error?: string }
      if (data.success) {
        toast.success("Webhook kuruldu! Artık siparişler otomatik gelecek.")
        void fetchStatus()
      } else {
        toast.error(data.error ?? "Webhook kurulumu başarısız.")
      }
    } catch {
      toast.error("Webhook kurulumu sırasında hata oluştu.")
    } finally {
      setWebhookKuruluyor(false)
    }
  }

  const handleKomisyonCek = async () => {
    if (selectedMarketplace !== "trendyol") {
      toast.info(`${mpConfig.label} için komisyon çekme özelliği yakında eklenecek.`)
      return
    }
    setKomisyonYukleniyor(true)
    setKomisyonSonucu(null)
    try {
      const bitis = new Date()
      const baslangic = new Date()
      baslangic.setDate(bitis.getDate() - 30)
      const fmt = (d: Date) => d.toISOString().slice(0, 10)
      const res = await fetch(
        `/api/marketplace/trendyol/finance?startDate=${fmt(baslangic)}&endDate=${fmt(bitis)}`
      )
      if (!res.ok) throw new Error("Finans verisi alınamadı")
      const json = await res.json() as {
        data: Array<{ komisyonOrani?: number; komisyonTutari?: number; saticiHakedis?: number }>
      }
      const rows = json.data ?? []
      const oranlıRows = rows.filter((r) => (r.komisyonOrani ?? 0) > 0)
      if (oranlıRows.length > 0) {
        const ortalamaOran = parseFloat(
          (oranlıRows.reduce((s, r) => s + (r.komisyonOrani ?? 0), 0) / oranlıRows.length).toFixed(2)
        )
        setKomisyonSonucu({ oran: ortalamaOran })
      } else {
        toast.info("Son 30 günde yeterli satış verisi bulunamadı.")
      }
    } catch {
      toast.error(`${mpConfig.label} komisyon verisi alınamadı.`)
    } finally {
      setKomisyonYukleniyor(false)
    }
  }

  // ─── Derived state ───────────────────────────────────────────────────────────

  const isConnected = connection?.connected === true
  const isMissingInfo = isConnected && !connection?.seller_id?.trim()
  const displayStatus: DisplayStatus = isMissingInfo
    ? "missing_info"
    : (connection?.status ?? "disconnected")
  const isSyncing = syncingProducts || syncingOrders || testing || normalizing || normalizingOrders
  const currentStatus = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG.disconnected

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pazaryeri Bağlantıları</h1>
        <p className="text-muted-foreground mt-1">
          Pazaryeri hesaplarınızı bağlayarak ürün ve sipariş verilerinizi otomatik senkronize edin.
        </p>
      </div>

      {/* Marketplace Card */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
        {/* Card Header */}
        <div
          className={`flex items-center justify-between p-6 border-b bg-gradient-to-r ${mpConfig.gradient}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-lg ${mpConfig.iconBg}`}
            >
              <Store className="h-6 w-6" />
            </div>
            <div>
              {/* Marketplace switcher */}
              <Popover open={marketplaceOpen} onOpenChange={setMarketplaceOpen}>
                <PopoverTrigger>
                  <button type="button" className="flex items-center gap-2 group text-left focus:outline-none">
                    <h2 className="text-xl font-bold">{mpConfig.label}</h2>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[rgba(255,255,255,0.06)] group-hover:bg-white/10 transition-colors">
                      <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-2 border-b border-border/50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pazaryeri ara..."
                        className="pl-9 bg-[rgba(255,255,255,0.04)] border-none focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="p-2 max-h-[300px] overflow-y-auto">
                    {Object.entries(MARKETPLACE_CONFIG)
                      .filter(([, v]) =>
                        v.label.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(([key, config]) => {
                        const isSelected = selectedMarketplace === key
                        return (
                          <button
                            key={key}
                            className={`flex items-start w-full gap-3 p-2.5 rounded-lg text-left transition-all hover:bg-white/5 ${
                              isSelected ? "bg-white/[0.03]" : ""
                            }`}
                            onClick={() => {
                              setSelectedMarketplace(key as MarketplaceKey)
                              setMarketplaceOpen(false)
                              setSearchQuery("")
                            }}
                          >
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded-lg text-white shadow-sm shrink-0 ${config.iconBg}`}
                            >
                              <Store className="h-5 w-5" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold">{config.label}</p>
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 whitespace-normal">
                                {config.description}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-0.5">{mpConfig.description}</p>
            </div>
          </div>

          {/* Status badge */}
          {!loading && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${currentStatus.color}`}
            >
              {currentStatus.icon}
              <span>
                {currentStatus.label}
                {isConnected && connection?.store_name && (
                  <span className="ml-1 opacity-75">— {connection.store_name}</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isConnected ? (
            /* ─── Connected State ─── */
            <div className="space-y-6">
              {/* Missing seller ID warning */}
              {isMissingInfo && (
                <div className="flex items-start gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                  <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-orange-400">
                    <p className="font-semibold">Satıcı ID eksik — senkronizasyon çalışmaz</p>
                    <p className="mt-0.5 opacity-90">
                      {mpConfig.sellerIdErrorText} Bağlantıyı kaldırıp Satıcı ID ile yeniden
                      kaydedin.
                    </p>
                  </div>
                </div>
              )}

              {/* Unsupplied orders warning */}
              {askidakiSiparis > 0 && selectedMarketplace === "trendyol" && (
                <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                  <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-orange-400">
                      {askidakiSiparis} Askıdaki Sipariş
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tedarik edilemeyen siparişleriniz var. Trendyol panelinden kontrol edin.
                    </p>
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mağaza Adı
                  </p>
                  <p className="text-sm font-semibold truncate">{connection?.store_name ?? "—"}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Satıcı ID
                  </p>
                  <p className="text-sm font-semibold truncate">{connection?.seller_id ?? "—"}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Son Senkronizasyon
                  </p>
                  <p className="text-sm font-semibold">
                    {connection?.last_sync_at
                      ? new Date(connection.last_sync_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Henüz yok"}
                  </p>
                </div>
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-400">
                  <p className="font-semibold">API bilgileriniz güvende</p>
                  <p className="mt-0.5 opacity-80">
                    Tüm kimlik bilgileri AES-256-GCM ile şifreli olarak saklanır. Hiçbir zaman düz
                    metin olarak depolanmaz.
                  </p>
                </div>
              </div>

              {/* Sync actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => void handleTestConnection()}
                  disabled={isSyncing}
                  className="gap-2 h-12"
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plug className="h-4 w-4" />
                  )}
                  Bağlantıyı Test Et
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleSyncProducts()}
                  disabled={isSyncing}
                  className="gap-2 h-12"
                >
                  {syncingProducts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  Ürünleri Senkronla
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleSyncOrders()}
                  disabled={isSyncing}
                  className="gap-2 h-12"
                >
                  {syncingOrders ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  Siparişleri Senkronla
                </Button>
              </div>

              {/* Normalize & match actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => void handleNormalize()}
                  disabled={isSyncing}
                  className="gap-2 h-12"
                >
                  {normalizing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Ürünleri Kârnet&apos;e Aktar
                </Button>
                <Link href="/marketplace/matching">
                  <Button variant="outline" className="gap-2 h-12 w-full">
                    <Link2 className="h-4 w-4" />
                    Eşleştirme Merkezi
                  </Button>
                </Link>
              </div>

              {/* Order metrics action */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={() => void handleNormalizeOrders()}
                  disabled={isSyncing}
                  className="gap-2 h-12"
                >
                  {normalizingOrders ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4" />
                  )}
                  Siparişleri İşle (Metrik Üret)
                </Button>
              </div>

              {/* Webhook (Trendyol only) */}
              {selectedMarketplace === "trendyol" && (
                <div className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Otomatik Bildirimler</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Webhook kurulunca siparişler anında Kârnet&apos;e gelir.
                      </p>
                    </div>
                    {connection?.webhook_active ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Aktif
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-orange-500/40 text-orange-500 hover:bg-orange-500/10"
                        onClick={() => void handleWebhookKur()}
                        disabled={webhookKuruluyor || isSyncing}
                      >
                        {webhookKuruluyor ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        {webhookKuruluyor ? "Kuruluyor…" : "Webhook Kur"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Order metrics panel */}
              {orderMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/20 p-4 space-y-1">
                    <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      Bu Ay Satış
                    </p>
                    <p className="text-xl font-bold text-emerald-400">
                      {orderMetrics.currentMonthSales}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-amber-500/10 border-amber-500/20 p-4 space-y-1">
                    <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                      Eşleşmeyen Sipariş
                    </p>
                    <p className="text-xl font-bold text-amber-400">
                      {orderMetrics.unmatchedOrders}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Metrik Güncelleme
                    </p>
                    <p className="text-xl font-bold">{orderMetrics.metricsUpdated}</p>
                  </div>
                </div>
              )}

              {/* Commission card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Gerçek Komisyon Oranı</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Son 30 günlük ödeme verilerinden ortalama komisyon oranını hesaplar
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleKomisyonCek()}
                    disabled={komisyonYukleniyor}
                    className="gap-2 shrink-0"
                  >
                    {komisyonYukleniyor ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <BarChart3 className="h-3.5 w-3.5" />
                    )}
                    {mpConfig.label}&apos;dan Çek
                  </Button>
                </div>
                {komisyonSonucu && (
                  <div className="flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary">%{komisyonSonucu.oran}</p>
                      <p className="text-xs text-muted-foreground">
                        Son 30 günde ortalama komisyon oranı — analizlerinizde bu oranı kullanabilirsiniz
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Finance card (Trendyol + connected + seller_id) */}
              {connection?.status === "connected" &&
                connection?.seller_id &&
                selectedMarketplace === "trendyol" && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <div>
                          <h3 className="font-semibold text-sm">Trendyol Finansal Özet</h3>
                          <p className="text-xs text-muted-foreground">
                            Trendyol&apos;dan otomatik çekilen komisyon ve kesinti verileri
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {(["7", "30", "90"] as const).map((gun) => (
                          <button
                            key={gun}
                            onClick={() => setSeciliAralik(gun)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              seciliAralik === gun
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {gun} gün
                          </button>
                        ))}
                      </div>
                    </div>

                    {finansYukleniyor && (
                      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Trendyol&apos;dan veriler çekiliyor...
                      </div>
                    )}

                    {finansHata && !finansYukleniyor && (
                      <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{finansHata}</span>
                        <button
                          onClick={() => void finansVerisiniGetir(seciliAralik)}
                          className="ml-auto text-xs underline"
                        >
                          Tekrar dene
                        </button>
                      </div>
                    )}

                    {finansData && !finansYukleniyor && finansData.kayitSayisi > 0 && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Toplam Komisyon</p>
                            <p className="text-lg font-bold text-destructive">
                              ₺
                              {finansData.toplamKomisyon.toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Satıcı Hakediş</p>
                            <p className="text-lg font-bold text-blue-500">
                              ₺
                              {finansData.toplamHakedis.toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Toplam Borç</p>
                            <p className="text-lg font-bold text-orange-500">
                              ₺
                              {finansData.toplamBorc.toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Toplam Alacak</p>
                            <p className="text-lg font-bold text-primary">
                              ₺
                              {finansData.toplamAlacak.toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                          <span>
                            Son {seciliAralik} günde {finansData.kayitSayisi} işlem
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            Trendyol&apos;dan canlı veri
                          </span>
                        </div>
                      </>
                    )}

                    {finansData && finansData.kayitSayisi === 0 && !finansYukleniyor && (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Son {seciliAralik} günde işlem bulunamadı.
                        {seciliAralik !== "90" && (
                          <>
                            <br />
                            <button
                              onClick={() => setSeciliAralik("90")}
                              className="text-primary underline mt-1 text-xs"
                            >
                              90 güne genişlet
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Last log */}
              {lastLog && (
                <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-3">
                  <RefreshCw className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">{lastLog}</p>
                </div>
              )}

              {/* Next steps */}
              {connection?.seller_id && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Şimdi ne yapabilirsin?
                  </p>

                  <Link href="/analysis/new">
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl p-4 hover:bg-primary/15 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Yeni Analiz Oluştur</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Komisyon verisi otomatik dolacak — sen sadece ürün adı ve maliyet gir.
                          </p>
                        </div>
                      </div>
                      <span className="text-muted-foreground group-hover:text-primary transition-colors text-lg">
                        →
                      </span>
                    </div>
                  </Link>

                  <Link href="/products">
                    <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl p-4 hover:bg-muted/60 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📦</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Ürünleri Kârnet&apos;e Aktar
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Trendyol ürünlerini Kârnet&apos;e çek, toplu analiz yap.
                          </p>
                        </div>
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors text-lg">
                        →
                      </span>
                    </div>
                  </Link>

                  <Link href="/dashboard">
                    <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl p-4 hover:bg-muted/60 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Dashboard&apos;u Gör</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Bu ayki komisyon, iade ve net hakediş özetini görüntüle.
                          </p>
                        </div>
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors text-lg">
                        →
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-start gap-2 pt-1">
                    <span className="text-yellow-500 text-sm">💡</span>
                    <p className="text-xs text-muted-foreground">
                      Yeni analiz oluştururken{" "}
                      <span className="text-primary font-medium">Trendyol&apos;dan Çek</span>{" "}
                      butonuna bas — komisyon oranı otomatik dolacak.
                    </p>
                  </div>
                </div>
              )}

              {/* Disconnect button */}
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={disconnecting || isSyncing}
                      className="gap-2"
                    >
                      {disconnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Bağlantıyı Kaldır
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {mpConfig.label} bağlantısını kaldırmak istediğinize emin misiniz? Tüm API
                        bilgileri silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void handleDisconnect()}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Bağlantıyı Kaldır
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            /* ─── Disconnected State ─── */
            <div className="space-y-6">
              {/* Benefits panel */}
              <div className="space-y-4">
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {mpConfig.label} hesabını bağla, gizli kayıpları gör
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Komisyon + kargo + iade + reklam bir arada hesaplanır. Manuel hesap biter.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex gap-3 items-start bg-muted/40 rounded-xl p-4">
                    <span className="text-2xl mt-0.5">📊</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Komisyon otomatik gelir</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mpConfig.label}&apos;dan gerçek komisyon, kargo ve hakediş verilerini
                        çekiyoruz. Sen hiçbir şey girmiyorsun.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start bg-muted/40 rounded-xl p-4">
                    <span className="text-2xl mt-0.5">🔍</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Hangi ürün zararda, anında gör
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Kârlı sandığın ürün aslında zarar ettiriyor olabilir. Bağlayınca hemen
                        göreceksin.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start bg-muted/40 rounded-xl p-4">
                    <span className="text-2xl mt-0.5">⏱️</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Aylarca süren hesap dakikaya iner
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        30 günlük sipariş, iade ve finans verisi tek tıkla analiz edilir.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <span className="text-green-500 text-lg mt-0.5">🔒</span>
                  <div>
                    <p className="text-sm font-semibold text-green-400">
                      Mağazana hiçbir şey yapamıyoruz
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      API bağlantısı sadece okuma yetkisi veriyor. Sipariş veremez, ürün
                      değiştiremez, hiçbir işlem yapamayız. Tüm key&apos;ler AES-256-GCM ile şifreli
                      saklanır — bankaların kullandığı standart.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Otomatik çekilen veriler
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "✅ Komisyon tutarları",
                      "✅ Kargo kesintileri",
                      "✅ İade verileri",
                      "✅ Hakediş ödemeleri",
                      "✅ Sipariş geçmişi",
                      "✅ Ürün listesi",
                    ].map((item) => (
                      <p key={item} className="text-xs text-muted-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "❌ Mağaza şifren",
                        "❌ Müşteri bilgileri",
                        "❌ Ödeme bilgilerin",
                        "❌ Kişisel veriler",
                      ].map((item) => (
                        <p key={item} className="text-xs text-muted-foreground">
                          {item}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Bu verilere erişimimiz yok ve olmayacak.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-border" />
                  <p className="text-xs text-muted-foreground">API bilgilerini gir, bağlantını kur</p>
                  <div className="flex-1 border-t border-border" />
                </div>
              </div>

              {/* Connection form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleSave()
                }}
                className="space-y-6"
              >
                {/* Info banner */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                  <ExternalLink className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-400">
                    <p className="font-semibold">API bilgilerinizi nereden bulabilirsiniz?</p>
                    <p className="mt-0.5 opacity-80">{mpConfig.helpText}</p>
                  </div>
                </div>

                {/* Test credentials button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const tc = mpConfig.testCredentials
                      setApiKey(tc.apiKey)
                      setApiSecret(tc.apiSecret)
                      setSellerId(tc.sellerId)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    Test kimlik bilgilerini kullan
                  </button>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* API Key / Username */}
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-sm font-medium">
                      {mpConfig.apiKeyLabel} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        placeholder={mpConfig.apiKeyPlaceholder}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="pr-10"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* API Secret / Password */}
                  <div className="space-y-2">
                    <Label htmlFor="apiSecret" className="text-sm font-medium">
                      {mpConfig.apiSecretLabel} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="apiSecret"
                        type={showApiSecret ? "text" : "password"}
                        placeholder={mpConfig.apiSecretPlaceholder}
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        className="pr-10"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                      >
                        {showApiSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Seller / Merchant ID */}
                  <div className="space-y-2">
                    <Label htmlFor="sellerId" className="text-sm font-medium">
                      {mpConfig.sellerIdLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sellerId"
                      type="text"
                      placeholder={`${mpConfig.sellerIdLabel} giriniz`}
                      value={sellerId}
                      onChange={(e) => {
                        setSellerId(e.target.value)
                        if (sellerIdError) setSellerIdError("")
                      }}
                      autoComplete="off"
                      required
                      aria-invalid={!!sellerIdError}
                      className={sellerIdError ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {sellerIdError && (
                      <p className="text-xs text-red-500">{sellerIdError}</p>
                    )}
                  </div>

                  {/* Store Name */}
                  <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-sm font-medium">
                      Mağaza Adı{" "}
                      <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                    </Label>
                    <Input
                      id="storeName"
                      type="text"
                      placeholder="Ör: Mağazam"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Security notice */}
                <div className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    API bilgileriniz AES-256-GCM ile şifrelenerek güvenli sunucularımızda saklanır.
                    Bilgileriniz hiçbir zaman tarayıcınızda depolanmaz veya loglara yazılmaz.
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving || !apiKey || !apiSecret || !sellerId}
                    className="gap-2 min-w-[200px]"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Store className="h-4 w-4" />
                    )}
                    Kaydet &amp; Bağlantıyı Test Et
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
