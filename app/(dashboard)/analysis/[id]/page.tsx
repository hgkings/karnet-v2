"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ResultDisplay } from "@/components/features/analysis/result-display"
import { SensitivityTable } from "@/components/features/analysis/sensitivity-table"
import { RiskBadge } from "@/components/shared/risk-badge"
import { apiClient } from "@/lib/api/client"

interface AnalysisDetail {
  id: string
  product_name: string
  marketplace: string
  risk_score: number
  risk_level: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  created_at: string
}

export default function AnalysisDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAnalysis() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<AnalysisDetail>(`/api/analyses/${id}`)
      setAnalysis((res.data ?? null) as AnalysisDetail | null)
    } catch {
      setError("Analiz yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchAnalysis() }, [id])

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error ?? "Analiz bulunamadı."}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchAnalysis}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  const o = analysis.outputs

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Baslik */}
      <div className="flex items-start gap-4">
        <Link href="/analysis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{analysis.product_name}</h1>
            <RiskBadge
              level={analysis.risk_level as "safe" | "moderate" | "risky" | "dangerous"}
              score={analysis.risk_score}
            />
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {analysis.marketplace} &middot; {analysis.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(analysis.created_at)) : ""}
          </p>
        </div>
      </div>

      {/* Sonuc gosterimi */}
      <ResultDisplay outputs={o} />

      {/* Sensitivity tablosu */}
      {Array.isArray(o._sensitivity) && (o._sensitivity as unknown[]).length > 0 && (
        <SensitivityTable scenarios={o._sensitivity as Array<{ label: string; unitNetProfit: number; marginPercent: number; difference: number }>} />
      )}
    </div>
  )
}
