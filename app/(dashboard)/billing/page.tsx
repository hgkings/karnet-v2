"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Crown, CreditCard, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
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

interface PlanOption {
  id: string
  name: string
  plan: string
  isPro: boolean
  amountTry: number
  durationDays: number
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

function formatTRY(v: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(v)
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6"><Skeleton className="h-[400px] w-full rounded-xl" /></div>}>
      <BillingContent />
    </Suspense>
  )
}

function BillingContent() {
  const searchParams = useSearchParams()
  const paymentToken = searchParams.get("token")
  const paymentError = searchParams.get("error")

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(!!paymentToken)
  const [verified, setVerified] = useState(false)
  const [verifiedPlan, setVerifiedPlan] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [profileRes, plansRes] = await Promise.all([
        apiClient.get<ProfileData>("/api/user/profile"),
        apiClient.get<PlanOption[]>("/api/analyses"), // plans endpoint placeholder
      ])
      setProfile((profileRes.data ?? null) as ProfileData | null)
      void plansRes
    } catch {
      toast.error("Profil yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Odeme dogrulama polling
  useEffect(() => {
    if (!paymentToken) return

    let attempts = 0
    const maxAttempts = 120 // 10 dk (5s * 120)

    const interval = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(interval)
        setVerifying(false)
        toast.error("Ödeme doğrulama zaman aşımına uğradı. Lütfen sayfayı yenileyin.")
        return
      }

      try {
        const res = await apiClient.get<{ verified: boolean; plan?: string }>(
          `/api/verify-payment?token=${paymentToken}`
        )
        const data = res.data as { verified: boolean; plan?: string } | undefined
        if (data?.verified) {
          clearInterval(interval)
          setVerifying(false)
          setVerified(true)
          setVerifiedPlan(data.plan ?? null)
          void fetchData()
        }
      } catch {
        // Sessiz — polling devam eder
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [paymentToken, fetchData])

  useEffect(() => {
    if (paymentError) {
      toast.error("Ödeme başarısız oldu. Lütfen tekrar deneyin.")
    }
  }, [paymentError])

  useEffect(() => { void fetchData() }, [fetchData])

  // Statik plan listesi (gateway yerine)
  useEffect(() => {
    setPlans([
      { id: "starter_monthly", name: "Starter Aylık", plan: "starter", isPro: false, amountTry: 399, durationDays: 30 },
      { id: "starter_yearly", name: "Starter Yıllık", plan: "starter", isPro: false, amountTry: 3990, durationDays: 365 },
      { id: "pro_monthly", name: "Pro Aylık", plan: "pro", isPro: true, amountTry: 799, durationDays: 30 },
      { id: "pro_yearly", name: "Pro Yıllık", plan: "pro", isPro: true, amountTry: 7990, durationDays: 365 },
    ])
  }, [])

  async function handlePurchase(planId: string) {
    setPurchasing(planId)
    try {
      const res = await apiClient.post<{ paymentUrl: string; token: string }>(
        "/api/paytr/create-payment",
        { planId }
      )
      const data = res.data as { paymentUrl: string; token: string } | undefined
      if (res.success && data?.paymentUrl) {
        // PayTR odeme sayfasini yeni sekmede ac
        window.open(data.paymentUrl, "_blank")
        // Mevcut sayfayi dogrulama moduna gecir
        window.location.href = `/billing?token=${data.token}`
      } else {
        toast.error(res.error ?? "Ödeme başlatılamadı.")
      }
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[200px] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-[250px] rounded-xl" />
          <Skeleton className="h-[250px] rounded-xl" />
        </div>
      </div>
    )
  }

  // Odeme dogrulama ekrani
  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold mb-2">Ödeme Doğrulanıyor...</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          PayTR üzerinden ödemenizi tamamladıktan sonra bu sayfa otomatik olarak güncellenecektir.
          Lütfen bu sayfayı kapatmayın.
        </p>
      </div>
    )
  }

  // Basarili odeme ekrani
  if (verified) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {verifiedPlan ?? "Pro"} Aktif!
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          Ödemeniz başarıyla tamamlandı. Tüm Pro özelliklerine erişebilirsiniz.
        </p>
        <Button onClick={() => window.location.href = "/dashboard"}>
          Dashboard&apos;a Git
        </Button>
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

      {/* Mevcut plan */}
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
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Plan secenekleri */}
      {!isPro && (
        <>
          <h2 className="text-xl font-semibold">Planınızı Yükseltin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => (
              <Card key={p.id} className={p.isPro ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <CardDescription>
                    {p.durationDays === 365 ? "Yıllık plan — 2 ay bedava" : "Aylık plan"}
                  </CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{formatTRY(p.amountTry)}</span>
                    <span className="text-muted-foreground text-sm">
                      /{p.durationDays === 365 ? "yıl" : "ay"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={p.isPro ? "default" : "outline"}
                    disabled={purchasing !== null}
                    onClick={() => handlePurchase(p.id)}
                  >
                    {purchasing === p.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CreditCard className="mr-2 h-4 w-4" />
                    {p.name} Satın Al
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
