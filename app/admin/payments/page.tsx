"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api/client"

interface Payment {
  id: string
  user_id: string
  email: string | null
  plan: string
  amount_try: number
  status: string
  created_at: string
  paid_at: string | null
}

function formatTRY(v: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(v)
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  paid: { label: "Ödendi", variant: "default" },
  created: { label: "Bekliyor", variant: "secondary" },
  failed: { label: "Başarısız", variant: "destructive" },
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  async function fetchPayments() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await apiClient.get<Payment[]>(`/api/admin/payments?${params.toString()}`)
      setPayments((res.data ?? []) as Payment[])
    } catch {
      toast.error("Ödemeler yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function activatePayment(paymentId: string) {
    try {
      const res = await apiClient.post("/api/admin/activate-payment", { paymentId })
      if (res.success) {
        toast.success("Ödeme aktifleştirildi.")
        void fetchPayments()
      } else {
        toast.error(res.error ?? "Ödeme aktifleştirilemedi.")
      }
    } catch {
      toast.error("Bir hata oluştu.")
    }
  }

  useEffect(() => { void fetchPayments() }, [statusFilter])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Ödemeler</h1>

      <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v) }}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          <SelectItem value="paid">Ödendi</SelectItem>
          <SelectItem value="created">Bekliyor</SelectItem>
          <SelectItem value="failed">Başarısız</SelectItem>
        </SelectContent>
      </Select>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ödeme Listesi</CardTitle></CardHeader>
        <CardContent>
          {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

          {!loading && payments.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Ödeme bulunamadı.</p>
          )}

          {!loading && payments.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="hidden md:table-cell">Tarih</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => {
                    const status = STATUS_BADGE[p.status] ?? { label: p.status, variant: "secondary" as const }
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm truncate max-w-[160px]">{p.email ?? "—"}</TableCell>
                        <TableCell className="text-sm">{p.plan}</TableCell>
                        <TableCell className="text-right font-medium">{formatTRY(p.amount_try)}</TableCell>
                        <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {p.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(p.created_at)) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {(p.status === "created" || p.status === "failed") && (
                            <Button size="sm" variant="outline" onClick={() => activatePayment(p.id)}>
                              Aktive Et
                            </Button>
                          )}
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
