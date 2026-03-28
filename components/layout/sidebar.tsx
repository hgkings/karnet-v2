'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { NAV_GROUPS } from '@/config/navigation';
import { KarnetLogo } from '@/components/shared/KarnetLogo';
import { ProStatusCard } from '@/components/shared/ProStatusCard';

function SidebarContent() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-[rgba(255,255,255,0.01)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <KarnetLogo size={36} />
        <span className="font-bold text-lg text-foreground tracking-tight">Kârnet</span>
      </div>

      {/* Pro status */}
      <div className="px-4 mb-4">
        <ProStatusCard />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-amber-500/10 border border-amber-500/15 text-amber-400'
                        : 'text-[rgba(255,255,255,0.5)] hover:text-foreground hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin link */}
        {user?.plan === 'admin' && (
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              YÖNETİM
            </p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors border border-transparent',
                pathname.startsWith('/admin')
                  ? 'bg-amber-500/10 border-amber-500/15 text-amber-400'
                  : 'text-[rgba(255,255,255,0.5)] hover:text-foreground hover:bg-white/5'
              )}
            >
              <Shield className="h-4 w-4 shrink-0" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* Version */}
      <div className="px-5 py-3 text-[10px] text-muted-foreground/40">
        v2.0.0
      </div>
    </div>
  );
}

export interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border/30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar (Sheet drawer) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-60 p-0 border-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
