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
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
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
