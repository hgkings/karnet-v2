"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, PackageOpen, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RiskBadge } from "@/components/shared/risk-badge"
import { apiClient } from "@/lib/api/client"

interface Analysis {
  id: string
  product_name: string
  marketplace: string
  risk_score: number
  risk_level: string
  outputs: Record<string, unknown>
  created_at: string
}

function formatTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

export default function AnalysisListPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAnalyses() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<Analysis[]>("/api/analyses")
      setAnalyses((res.data ?? []) as Analysis[])
    } catch {
      setError("Analizler yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiClient.del(`/api/analyses/${id}`)
      setAnalyses(prev => prev.filter(a => a.id !== id))
      toast.success("Analiz silindi.")
    } catch {
      toast.error("Analiz silinemedi. Lütfen tekrar deneyin.")
    }
  }

  useEffect(() => { void fetchAnalyses() }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analizler</h1>
          <p className="text-muted-foreground text-sm">{analyses.length} ürün analizi</p>
        </div>
        <Link href="/analysis">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Analiz
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ürün Analizleri</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={fetchAnalyses}>
                Tekrar Dene
              </Button>
            </div>
          )}

          {loading && !error && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!loading && !error && analyses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Henüz analiz yok</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                İlk ürün analizinizi oluşturarak kârlılığınızı keşfedin.
              </p>
              <Link href="/analysis">
                <Button>Yeni Analiz Oluştur</Button>
              </Link>
            </div>
          )}

          {!loading && !error && analyses.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="hidden sm:table-cell">Pazaryeri</TableHead>
                    <TableHead className="text-right">Birim Kâr</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Marj</TableHead>
                    <TableHead className="hidden sm:table-cell">Risk</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Tarih</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((a) => {
                    const profit = (a.outputs?.unit_net_profit as number) ?? 0
                    const margin = (a.outputs?.margin_pct as number) ?? (a.outputs?.marginPercent as number) ?? 0
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Link href={`/analysis/${a.id}`} className="font-medium hover:underline">
                            {a.product_name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">{a.marketplace}</TableCell>
                        <TableCell className={`text-right font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatTRY(profit)}
                        </TableCell>
                        <TableCell className={`text-right hidden md:table-cell ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                          %{margin.toFixed(1)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RiskBadge level={a.risk_level as "safe" | "moderate" | "risky" | "dangerous"} score={a.risk_score} />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs hidden md:table-cell">
                          {a.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(a.created_at)) : "—"}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;{a.product_name}&quot; analizini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(a.id)} className="bg-destructive text-destructive-foreground">
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
