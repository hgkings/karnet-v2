"use client"

import { useEffect, useState, useCallback } from "react"
import { apiClient } from "@/lib/api/client"

interface AnalysisRow {
  id: string
  product_name: string
  marketplace: string
  risk_score: number
  risk_level: string
  outputs: Record<string, unknown>
  created_at: string
}

export function useAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<AnalysisRow[]>("/api/analyses")
      setAnalyses((res.data ?? []) as AnalysisRow[])
    } catch {
      setError("Analizler yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  return { analyses, loading, error, refresh }
}
