"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api/client"

interface Ticket {
  id: string
  user_email: string | null
  subject: string
  category: string
  priority: string
  status: string
  message: string
  admin_reply: string | null
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  acik: "Açık", inceleniyor: "İnceleniyor", cevaplandi: "Cevaplandı", kapali: "Kapalı",
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function fetchTickets() {
    setLoading(true)
    try {
      const res = await apiClient.get<Ticket[]>("/api/admin/stats")
      setTickets((res.data ?? []) as Ticket[])
    } catch {
      toast.error("Talepler yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function handleReply(ticketId: string) {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await apiClient.patch(`/api/admin/support/tickets/${ticketId}`, {
        admin_reply: replyText,
        status: "cevaplandi",
      })
      toast.success("Cevap gönderildi.")
      setReplyText("")
      setReplyingId(null)
      void fetchTickets()
    } catch {
      toast.error("Cevap gönderilemedi.")
    } finally {
      setSubmitting(false)
    }
  }

  async function closeTicket(ticketId: string) {
    try {
      await apiClient.del(`/api/admin/support/tickets/${ticketId}`)
      toast.success("Talep kapatıldı.")
      void fetchTickets()
    } catch {
      toast.error("Talep kapatılamadı.")
    }
  }

  useEffect(() => { void fetchTickets() }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Destek Talepleri</h1>

      {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>}

      {!loading && tickets.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">Talep bulunamadı.</p>
      )}

      {!loading && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-sm font-medium truncate">{t.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{STATUS_LABELS[t.status] ?? t.status}</Badge>
                    <Badge variant="secondary">{t.priority}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t.user_email} &middot; {t.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(t.created_at)) : ""}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{t.message}</p>
                {t.admin_reply && (
                  <div className="p-3 rounded bg-muted/50 border-l-2 border-primary">
                    <p className="text-xs font-medium mb-1">Cevap:</p>
                    <p className="text-sm">{t.admin_reply}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Dialog open={replyingId === t.id} onOpenChange={(o) => { if (!o) setReplyingId(null) }}>
                    <DialogTrigger>
                      <Button size="sm" variant="outline" onClick={() => setReplyingId(t.id)}>Cevapla</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Talebe Cevap Ver</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-3 rounded bg-muted text-sm">{t.message}</div>
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Cevabınızı yazın..."
                          rows={4}
                          disabled={submitting}
                        />
                        <Button onClick={() => handleReply(t.id)} disabled={submitting || !replyText.trim()}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Cevapla &amp; Kaydet
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {t.status !== "kapali" && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => closeTicket(t.id)}>
                      Kapat
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
