"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  TrendingDown,
  Wallet,
  Store,
  FileText,
  Upload,
  Percent,
  CreditCard,
  User,
  HelpCircle,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"

// ----------------------------------------------------------------
// Menu yapilandirmasi
// ----------------------------------------------------------------

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "MENÜ",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/analysis", label: "Yeni Analiz", icon: PlusCircle },
      { href: "/products", label: "Ürünler", icon: Package },
      { href: "/breakeven", label: "Başabaş", icon: TrendingDown },
      { href: "/cashplan", label: "Nakit Planı", icon: Wallet },
      { href: "/marketplace", label: "Pazaryeri", icon: Store },
    ],
  },
  {
    label: "HIZLI İŞLEMLER",
    items: [
      { href: "/pdf", label: "PDF Rapor", icon: FileText },
      { href: "/import", label: "CSV İçe Aktar", icon: Upload },
      { href: "/commissions", label: "Komisyon Oranları", icon: Percent },
      { href: "/pricing", label: "Fiyatlandırma", icon: CreditCard },
    ],
  },
  {
    label: "HESAP",
    items: [
      { href: "/settings", label: "Profil", icon: User },
      { href: "/support", label: "Destek", icon: HelpCircle },
      { href: "/settings", label: "Ayarlar", icon: Settings },
    ],
  },
]

// ----------------------------------------------------------------
// Pro durum karti
// ----------------------------------------------------------------

interface ProInfo {
  isPro: boolean
  planLabel?: string
  expiresAt?: string | null
  remainingDays?: number
}

function ProStatusSection({ proInfo }: { proInfo: ProInfo }) {
  if (proInfo.isPro) {
    return (
      <div className="mx-3 mb-4 rounded-lg p-3" style={{ backgroundColor: "#1a1a2e" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">{proInfo.planLabel ?? "Pro"}</span>
          <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
            Aktif
          </span>
        </div>
        <div className="space-y-1 text-xs" style={{ color: "#94a3b8" }}>
          {proInfo.expiresAt && (
            <p>Bitiş: {new Intl.DateTimeFormat("tr-TR").format(new Date(proInfo.expiresAt))}</p>
          )}
          {proInfo.remainingDays !== undefined && (
            <p>Kalan: {proInfo.remainingDays} gün</p>
          )}
          <p>Yenileme: Manuel</p>
        </div>
        <Link
          href="/billing"
          className="mt-2 block w-full rounded-md py-1.5 text-center text-xs font-medium transition-colors"
          style={{ backgroundColor: "rgba(234, 88, 12, 0.15)", color: "#ea580c" }}
        >
          Planı Yönet
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-3 mb-4 rounded-lg p-3" style={{ backgroundColor: "#1a1a2e" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Ücretsiz Plan</span>
      </div>
      <p className="text-xs mb-2" style={{ color: "#64748b" }}>Sınırlı özellikler</p>
      <Link
        href="/pricing"
        className="block w-full rounded-md py-1.5 text-center text-xs font-medium transition-colors"
        style={{ backgroundColor: "rgba(234, 88, 12, 0.15)", color: "#ea580c" }}
      >
        Planı Yükselt
      </Link>
    </div>
  )
}

// ----------------------------------------------------------------
// Sidebar icerik
// ----------------------------------------------------------------

function SidebarContent({ proInfo }: { proInfo: ProInfo }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#0f0f1a" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm"
          style={{ backgroundColor: "#ea580c" }}
        >
          K
        </div>
        <Link href="/dashboard" className="font-bold text-lg text-white">
          Kârnet
        </Link>
      </div>

      {/* Pro durum */}
      <ProStatusSection proInfo={proInfo} />

      {/* Menu gruplari */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "#475569" }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-l-2"
                        : "hover:bg-white/5"
                    )}
                    style={
                      isActive
                        ? { backgroundColor: "rgba(234, 88, 12, 0.15)", color: "#ea580c", borderColor: "#ea580c" }
                        : { color: "#94a3b8" }
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Versiyon */}
      <div className="px-4 py-3 text-[10px]" style={{ color: "#475569" }}>
        v2.0.0
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// Export
// ----------------------------------------------------------------

export interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proInfo?: ProInfo
}

export function Sidebar({ open, onOpenChange, proInfo }: SidebarProps) {
  const info: ProInfo = proInfo ?? { isPro: false }

  return (
    <>
      {/* Masaustu sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col" style={{ backgroundColor: "#0f0f1a" }}>
        <SidebarContent proInfo={info} />
      </aside>

      {/* Mobil sidebar (Sheet drawer) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-60 p-0 border-0" style={{ backgroundColor: "#0f0f1a" }}>
          <SidebarContent proInfo={info} />
        </SheetContent>
      </Sheet>
    </>
  )
}
