"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calculator,
  Package,
  Store,
  Settings,
  HelpCircle,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analysis", label: "Analiz", icon: Calculator },
  { href: "/products", label: "Ürünler", icon: Package },
  { href: "/marketplace", label: "Pazaryeri", icon: Store },
  { href: "/settings", label: "Ayarlar", icon: Settings },
  { href: "/support", label: "Destek", icon: HelpCircle },
  { href: "/billing", label: "Abonelik", icon: CreditCard },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  return (
    <>
      {/* Masaustu sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="font-bold text-lg text-primary">
            Kârnet
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobil sidebar (Sheet drawer) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-60 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="font-bold text-lg text-primary">
              Kârnet
            </Link>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
