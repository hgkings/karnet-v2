import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Target,
  Landmark,
  Store,
  User,
  Settings,
  Crown,
  FileText,
  Upload,
  CreditCard,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  restricted?: boolean;
  highlight?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Yeni Analiz', href: '/analysis/new', icon: PlusCircle },
  { label: 'Ürünler', href: '/products', icon: Package },
  { label: 'Başabaş', href: '/break-even', icon: Target, restricted: true },
  { label: 'Nakit Planı', href: '/cash-plan', icon: Landmark, restricted: true },
  { label: 'Pazaryeri', href: '/marketplace', icon: Store, restricted: true },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Premium', href: '/pricing', icon: Crown, highlight: true },
  { label: 'Profil', href: '/account', icon: User },
  { label: 'Destek', href: '/support', icon: MessageSquare },
  { label: 'Ayarlar', href: '/settings', icon: Settings },
];

export const QUICK_ACTIONS: NavItem[] = [
  { label: 'PDF Rapor', href: '/dashboard', icon: FileText },
  { label: 'CSV İçe Aktar', href: '/products', icon: Upload },
  { label: 'Komisyon Oranları', href: '/settings/commission-rates', icon: Store },
  { label: 'Fiyatlandırma', href: '/pricing', icon: CreditCard },
];
