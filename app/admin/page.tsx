"use client"

import { useEffect, useState } from "react"
import { KpiCard } from "@/components/shared/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/client"

function formatTRY(v: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(v)
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    totalAnalyses: 0,
    totalRevenue: 0,
    openTickets: 0,
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await apiClient.get<typeof stats>("/api/admin/stats")
        if (res.data) setStats(res.data)
      } catch { /* */ }
      setLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[100px] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard title="Toplam Kullanıcı" value={String(stats.totalUsers)} />
          <KpiCard title="Pro Kullanıcı" value={String(stats.proUsers)} variant="profit" />
          <KpiCard title="Ücretsiz Kullanıcı" value={String(stats.freeUsers)} />
          <KpiCard title="Toplam Analiz" value={String(stats.totalAnalyses)} />
          <KpiCard title="Toplam Gelir" value={formatTRY(stats.totalRevenue)} variant="profit" />
          <KpiCard title="Açık Talep" value={String(stats.openTickets)} variant={stats.openTickets > 0 ? "loss" : "default"} />
        </div>
      )}
    </div>
  )
}
