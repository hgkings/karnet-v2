"use client"

import Link from "next/link"
import { PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RiskBadge } from "@/components/shared/risk-badge"

interface Analysis {
  id: string
  product_name: string
  marketplace: string
  risk_score: number
  risk_level: string
  outputs: Record<string, unknown>
  created_at: string
}

interface RecentAnalysesProps {
  analyses: Analysis[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

function formatTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

export function RecentAnalyses({ analyses, loading, error, onRetry }: RecentAnalysesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Son Analizler</CardTitle>
          <Link href="/analysis">
            <Button variant="outline" size="sm">Tümünü Gör</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
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
              İlk ürün analizinizi oluşturarak başlayın.
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
                  <TableHead className="text-right">Net Kâr</TableHead>
                  <TableHead className="hidden sm:table-cell">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((a) => {
                  const profit = (a.outputs?.unit_net_profit as number) ?? 0
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Link href={`/analysis/${a.id}`} className="font-medium hover:underline">
                          {a.product_name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell capitalize">
                        {a.marketplace}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatTRY(profit)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <RiskBadge level={a.risk_level as "safe" | "moderate" | "risky" | "dangerous"} />
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
  )
}
