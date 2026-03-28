import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { LayoutDashboard, Users, CreditCard, HelpCircle, MessageSquare } from "lucide-react"

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users },
  { href: "/admin/payments", label: "Ödemeler", icon: CreditCard },
  { href: "/admin/support", label: "Destek", icon: HelpCircle },
  { href: "/admin/comments", label: "Yorumlar", icon: MessageSquare },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  // Admin kontrolu — profil plan'i kontrol et
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single()

  if (profile?.plan !== "admin") redirect("/dashboard")

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="font-bold text-lg text-primary">Admin</Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b px-4 md:px-6">
          <Link href="/admin" className="font-bold text-lg text-primary md:hidden">Admin</Link>
          <div className="flex-1" />
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard&apos;a Dön</Link>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
