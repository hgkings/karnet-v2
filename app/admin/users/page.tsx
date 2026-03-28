"use client"

import { useEffect, useState } from "react"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/client"

interface User {
  id: string
  email: string
  plan: string
  created_at: string
  pro_expires_at: string | null
}

const PLAN_COLORS: Record<string, string> = {
  free: "secondary",
  starter: "default",
  pro: "default",
  admin: "destructive",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [changingPlan, setChangingPlan] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (planFilter !== "all") params.set("plan", planFilter)
      const res = await apiClient.get<User[]>(`/api/admin/users?${params.toString()}`)
      setUsers((res.data ?? []) as User[])
    } catch {
      toast.error("Kullanıcılar yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function changePlan(userId: string, plan: string) {
    setChangingPlan(userId)
    try {
      await apiClient.patch("/api/admin/users", { userId, plan })
      toast.success("Plan güncellendi.")
      void fetchUsers()
    } catch {
      toast.error("Plan güncellenemedi.")
    } finally {
      setChangingPlan(null)
    }
  }

  useEffect(() => { void fetchUsers() }, [planFilter])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Kullanıcılar</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="E-posta ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="pl-9"
          />
        </div>
        <Select value={planFilter} onValueChange={(v) => { if (v) setPlanFilter(v) }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Planlar</SelectItem>
            <SelectItem value="free">Ücretsiz</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchUsers} variant="outline">Ara</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Kullanıcı Listesi</CardTitle></CardHeader>
        <CardContent>
          {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

          {!loading && users.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Kullanıcı bulunamadı.</p>
          )}

          {!loading && users.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="hidden md:table-cell">Kayıt</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-sm truncate max-w-[200px]">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={(PLAN_COLORS[u.plan] as "default" | "secondary" | "destructive") ?? "secondary"}>
                          {u.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {u.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(u.created_at)) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select value={u.plan} onValueChange={(v) => { if (v) changePlan(u.id, v) }}>
                          <SelectTrigger className="w-28 h-8 text-xs">
                            {changingPlan === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue placeholder="Plan Değiştir" />}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Ücretsiz</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
