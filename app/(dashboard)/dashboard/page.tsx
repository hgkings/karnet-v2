"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/features/dashboard/stats-cards"
import { RecentAnalyses } from "@/components/features/dashboard/recent-analyses"
import { apiClient } from "@/lib/api/client"

interface DashboardData {
  analyses: Array<{
    id: string
    product_name: string
    marketplace: string
    risk_score: number
    risk_level: string
    outputs: Record<string, unknown>
    created_at: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<DashboardData["analyses"]>("/api/analyses")
      setData({ analyses: (res.data ?? []) as DashboardData["analyses"] })
    } catch {
      setError("Veriler yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchData() }, [])

  const analyses = data?.analyses ?? []
  const totalProfit = analyses.reduce((sum, a) => {
    const profit = (a.outputs?.monthly_net_profit as number) ?? 0
    return sum + profit
  }, 0)
  const totalRevenue = analyses.reduce((sum, a) => {
    const rev = (a.outputs?.monthly_revenue as number) ?? 0
    return sum + rev
  }, 0)
  const riskyCount = analyses.filter(a => a.risk_level === "risky" || a.risk_level === "dangerous").length

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Kâr analizinizin özeti</p>
        </div>
        <Link href="/analysis">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Analiz
          </Button>
        </Link>
      </div>

      <StatsCards
        totalProfit={totalProfit}
        totalRevenue={totalRevenue}
        analysisCount={analyses.length}
        riskyCount={riskyCount}
        loading={loading}
      />

      <RecentAnalyses
        analyses={analyses.slice(0, 10)}
        loading={loading}
        error={error}
        onRetry={fetchData}
      />
    </div>
  )
}
