"use client"

import { useEffect, useState } from "react"
import { Store, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { apiClient } from "@/lib/api/client"

interface Connection {
  id: string
  marketplace: string
  status: string
  store_name: string | null
  last_sync_at: string | null
}

const MARKETPLACE_INFO: Record<string, { label: string; description: string }> = {
  trendyol: { label: "Trendyol", description: "Siparişler, ürünler ve komisyon oranları" },
  hepsiburada: { label: "Hepsiburada", description: "Siparişler, ürünler ve finans verileri" },
}

export default function MarketplacePage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  async function fetchConnections() {
    setLoading(true)
    try {
      const [ty, hb] = await Promise.all([
        apiClient.get<Connection[]>("/api/marketplace/trendyol"),
        apiClient.get<Connection[]>("/api/marketplace/hepsiburada"),
      ])
      const all = [
        ...((ty.data ?? []) as Connection[]),
        ...((hb.data ?? []) as Connection[]),
      ]
      setConnections(all)
    } catch {
      toast.error("Bağlantılar yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect(connectionId: string, marketplace: string) {
    setDisconnecting(connectionId)
    try {
      const endpoint = marketplace === "trendyol" ? "/api/marketplace/trendyol" : "/api/marketplace/hepsiburada"
      await apiClient.del(endpoint, { connectionId })
      setConnections(prev => prev.filter(c => c.id !== connectionId))
      toast.success("Bağlantı kesildi.")
    } catch {
      toast.error("Bağlantı kesilemedi.")
    } finally {
      setDisconnecting(null)
    }
  }

  useEffect(() => { void fetchConnections() }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Pazaryeri Bağlantıları</h1>
        <p className="text-muted-foreground text-sm">Marketplace API entegrasyonları</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-[150px] rounded-xl" />
          <Skeleton className="h-[150px] rounded-xl" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(MARKETPLACE_INFO).map(([key, info]) => {
            const conn = connections.find(c => c.marketplace === key)
            const isConnected = conn?.status === "connected"

            return (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="h-6 w-6 text-muted-foreground" />
                      <CardTitle className="text-lg">{info.label}</CardTitle>
                    </div>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? (
                        <><CheckCircle className="mr-1 h-3 w-3" />Bağlı</>
                      ) : (
                        <><XCircle className="mr-1 h-3 w-3" />Bağlı Değil</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                  {conn?.store_name && (
                    <p className="text-sm">Mağaza: <span className="font-medium">{conn.store_name}</span></p>
                  )}
                  {conn?.last_sync_at && (
                    <p className="text-xs text-muted-foreground">
                      Son senkronizasyon: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(conn.last_sync_at))}
                    </p>
                  )}
                  {isConnected && conn ? (
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant="outline" size="sm" disabled={disconnecting === conn.id}>
                          {disconnecting === conn.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                          Bağlantıyı Kes
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {info.label} bağlantısını kesmek istediğinize emin misiniz? API anahtarlarınız silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDisconnect(conn.id, key)} className="bg-destructive text-destructive-foreground">
                            Bağlantıyı Kes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button size="sm">Bağlan</Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
