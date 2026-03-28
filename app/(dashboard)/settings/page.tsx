"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/client"

interface Profile {
  full_name: string | null
  email_notifications_enabled: boolean
  email_weekly_report: boolean
  email_risk_alert: boolean
  email_margin_alert: boolean
  email_pro_expiry: boolean
  target_margin: number | null
  default_marketplace: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await apiClient.get<Profile>("/api/user/profile")
      setProfile((res.data ?? null) as Profile | null)
    } catch {
      toast.error("Profil yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    try {
      await apiClient.patch("/api/user/profile", profile)
      toast.success("Ayarlar kaydedildi.")
    } catch {
      toast.error("Ayarlar kaydedilemedi.")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => { void fetchProfile() }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">Profil yüklenemedi.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchProfile}>Tekrar Dene</Button>
        </div>
      </div>
    )
  }

  function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(prev => prev ? { ...prev, [key]: value } : null)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground text-sm">Profil ve bildirim tercihleriniz</p>
      </div>

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              value={profile.full_name ?? ""}
              onChange={(e) => updateField("full_name", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bildirimler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">E-posta Bildirimleri</CardTitle>
          <CardDescription>Hangi e-postaları almak istediğinizi seçin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email_notifications_enabled" as const, label: "Tüm Bildirimler", desc: "Ana açma/kapama" },
            { key: "email_weekly_report" as const, label: "Haftalık Rapor", desc: "Her hafta özet e-posta" },
            { key: "email_risk_alert" as const, label: "Risk Uyarısı", desc: "Yüksek riskli ürün bildirimi" },
            { key: "email_margin_alert" as const, label: "Marj Uyarısı", desc: "Hedef marjın altındaki ürünler" },
            { key: "email_pro_expiry" as const, label: "Pro Bitiş Uyarısı", desc: "Abonelik bitiş hatırlatması" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={profile[key] ?? true}
                onCheckedChange={(v) => updateField(key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Kaydet
      </Button>
    </div>
  )
}
