"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Crown, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/client"

interface ProfileData {
  plan: string
  is_pro: boolean
  plan_type: string | null
  pro_started_at: string | null
  pro_expires_at: string | null
}

const PLAN_LABELS: Record<string, string> = {
  free: "Ücretsiz",
  starter: "Starter",
  starter_monthly: "Starter (Aylık)",
  starter_yearly: "Starter (Yıllık)",
  pro: "Pro",
  pro_monthly: "Pro (Aylık)",
  pro_yearly: "Pro (Yıllık)",
  admin: "Admin",
}

export default function BillingPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await apiClient.get<ProfileData>("/api/user/profile")
      setProfile((res.data ?? null) as ProfileData | null)
    } catch {
      /* sessiz hata */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchProfile() }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    )
  }

  const plan = profile?.plan ?? "free"
  const isPro = profile?.is_pro ?? false
  const planLabel = PLAN_LABELS[profile?.plan_type ?? plan] ?? plan

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Abonelik</h1>
        <p className="text-muted-foreground text-sm">Plan ve ödeme bilgileriniz</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Crown className={`h-6 w-6 ${isPro ? "text-amber-500" : "text-muted-foreground"}`} />
            <div>
              <CardTitle className="text-lg">{planLabel}</CardTitle>
              <CardDescription>
                {isPro ? "Pro özelliklere erişiminiz var" : "Sınırlı özellikler"}
              </CardDescription>
            </div>
            <Badge variant={isPro ? "default" : "secondary"} className="ml-auto">
              {isPro ? "Aktif" : "Ücretsiz"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.pro_started_at && (
            <p className="text-sm text-muted-foreground">
              Başlangıç: {new Intl.DateTimeFormat("tr-TR").format(new Date(profile.pro_started_at))}
            </p>
          )}
          {profile?.pro_expires_at && (
            <p className="text-sm text-muted-foreground">
              Bitiş: {new Intl.DateTimeFormat("tr-TR").format(new Date(profile.pro_expires_at))}
            </p>
          )}

          {!isPro && (
            <Link href="/pricing">
              <Button className="w-full sm:w-auto">
                <CreditCard className="mr-2 h-4 w-4" />
                Planınızı Yükseltin
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
