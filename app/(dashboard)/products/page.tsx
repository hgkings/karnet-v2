"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RiskBadge } from "@/components/shared/risk-badge"
import { apiClient } from "@/lib/api/client"

interface Product {
  id: string
  product_name: string
  marketplace: string
  risk_level: string
  outputs: Record<string, unknown>
}

function formatTRY(v: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(v)
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetch() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<Product[]>("/api/analyses")
      setProducts((res.data ?? []) as Product[])
    } catch {
      setError("Ürünler yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetch() }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="text-muted-foreground text-sm">Tüm ürün analizleriniz</p>
        </div>
        <Link href="/analysis">
          <Button><Plus className="mr-2 h-4 w-4" />Yeni Ürün</Button>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ürün Listesi</CardTitle></CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={fetch}>Tekrar Dene</Button>
            </div>
          )}
          {loading && !error && (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Henüz ürün yok</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">İlk ürününüzü ekleyerek başlayın.</p>
              <Link href="/analysis"><Button>Ürün Ekle</Button></Link>
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="hidden sm:table-cell">Pazaryeri</TableHead>
                    <TableHead className="text-right">Birim Kâr</TableHead>
                    <TableHead className="hidden sm:table-cell">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => {
                    const profit = (p.outputs?.unit_net_profit as number) ?? (p.outputs?.unitNetProfit as number) ?? 0
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link href={`/analysis/${p.id}`} className="font-medium hover:underline">{p.product_name}</Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">{p.marketplace}</TableCell>
                        <TableCell className={`text-right font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatTRY(profit)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RiskBadge level={p.risk_level as "safe" | "moderate" | "risky" | "dangerous"} />
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
