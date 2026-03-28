"use client"

import { useEffect, useState } from "react"
import { Loader2, HelpCircle, Mail, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/client"

interface Ticket {
  id: string
  subject: string
  category: string
  priority: string
  status: string
  message: string
  admin_reply: string | null
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  acik: { label: "Açık", variant: "destructive" },
  inceleniyor: { label: "İnceleniyor", variant: "default" },
  cevaplandi: { label: "Cevaplandı", variant: "secondary" },
  kapali: { label: "Kapalı", variant: "secondary" },
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("teknik")
  const [priority, setPriority] = useState("normal")
  const [message, setMessage] = useState("")

  async function fetchTickets() {
    setLoading(true)
    try {
      const res = await apiClient.get<Ticket[]>("/api/support/tickets")
      setTickets((res.data ?? []) as Ticket[])
    } catch {
      toast.error("Talepler yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await apiClient.post("/api/support/tickets", { subject, category, priority, message })
      if (res.success) {
        toast.success("Destek talebiniz oluşturuldu.")
        setShowForm(false)
        setSubject("")
        setMessage("")
        void fetchTickets()
      } else {
        toast.error(res.error ?? "Talep oluşturulamadı.")
      }
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => { void fetchTickets() }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Destek</h1>
          <p className="text-muted-foreground text-sm">Yardım talepleriniz</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Kapat" : "Yeni Talep"}
        </Button>
      </div>

      {/* Iletisim bilgileri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Mail className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">E-posta</p>
            <p className="text-xs text-muted-foreground">karnet.destek@gmail.com</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <MessageCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">WhatsApp</p>
            <p className="text-xs text-muted-foreground">Hızlı destek</p>
          </div>
        </div>
      </div>

      {/* Yeni talep formu */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Yeni Destek Talebi</CardTitle>
            <CardDescription>Sorununuzu detaylı açıklayın</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Konu <span className="text-destructive">*</span></Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Kısa bir başlık" maxLength={200} required disabled={submitting} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={category} onValueChange={(v) => { if (v) setCategory(v) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teknik">Teknik</SelectItem>
                      <SelectItem value="odeme">Ödeme</SelectItem>
                      <SelectItem value="hesap">Hesap</SelectItem>
                      <SelectItem value="oneri">Öneri</SelectItem>
                      <SelectItem value="diger">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Öncelik</Label>
                  <Select value={priority} onValueChange={(v) => { if (v) setPriority(v) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dusuk">Düşük</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="yuksek">Yüksek</SelectItem>
                      <SelectItem value="acil">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mesaj <span className="text-destructive">*</span></Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Sorununuzu detaylı açıklayın (en az 20 karakter)" minLength={20} maxLength={5000} rows={5} required disabled={submitting} />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Talebi Gönder
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Talep listesi */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Talepleriniz</CardTitle></CardHeader>
        <CardContent>
          {loading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>}

          {!loading && tickets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Henüz talep yok</h3>
              <p className="text-muted-foreground text-sm mt-1">Bir sorun yaşıyorsanız destek talebi oluşturun.</p>
            </div>
          )}

          {!loading && tickets.length > 0 && (
            <div className="space-y-4">
              {tickets.map((t) => {
                const status = STATUS_LABELS[t.status] ?? { label: t.status, variant: "secondary" as const }
                return (
                  <div key={t.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm truncate">{t.subject}</h4>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
                    {t.admin_reply && (
                      <div className="mt-2 p-3 rounded bg-muted/50 border-l-2 border-primary">
                        <p className="text-xs font-medium mb-1">Kârnet Destek:</p>
                        <p className="text-sm">{t.admin_reply}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(t.created_at)) : ""}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
