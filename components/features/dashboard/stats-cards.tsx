import { KpiCard } from "@/components/shared/kpi-card"

interface StatsCardsProps {
  totalProfit: number
  totalRevenue: number
  analysisCount: number
  riskyCount: number
  loading: boolean
}

function formatTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

export function StatsCards({ totalProfit, totalRevenue, analysisCount, riskyCount, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard
        title="Aylık Net Kâr"
        value={formatTRY(totalProfit)}
        variant={totalProfit >= 0 ? "profit" : "loss"}
        subtitle="Tüm ürünler toplamı"
        loading={loading}
      />
      <KpiCard
        title="Aylık Ciro"
        value={formatTRY(totalRevenue)}
        subtitle="Tahmini gelir"
        loading={loading}
      />
      <KpiCard
        title="Toplam Analiz"
        value={String(analysisCount)}
        subtitle="Kayıtlı ürün"
        loading={loading}
      />
      <KpiCard
        title="Risk Uyarısı"
        value={String(riskyCount)}
        variant={riskyCount > 0 ? "loss" : "default"}
        subtitle="Riskli / tehlikeli"
        loading={loading}
      />
    </div>
  )
}
