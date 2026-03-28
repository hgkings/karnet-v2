import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Profil bilgilerini cek (pro durum icin)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, is_pro, plan_type, pro_expires_at")
    .eq("id", user.id)
    .single()

  const isPro = profile?.is_pro ?? false
  const expiresAt = profile?.pro_expires_at ?? null
  const remainingDays = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : undefined

  const planLabels: Record<string, string> = {
    pro_monthly: "Pro Aylık",
    pro_yearly: "Pro Yıllık",
    starter_monthly: "Starter Aylık",
    starter_yearly: "Starter Yıllık",
    pro: "Pro",
    starter: "Starter",
    admin: "Admin",
  }

  const proInfo = {
    isPro,
    planLabel: planLabels[profile?.plan_type ?? profile?.plan ?? ""] ?? (isPro ? "Pro" : undefined),
    expiresAt,
    remainingDays,
  }

  return (
    <DashboardLayout userEmail={user.email ?? undefined} proInfo={proInfo}>
      {children}
    </DashboardLayout>
  )
}
