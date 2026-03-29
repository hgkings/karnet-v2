'use client';

import Link from 'next/link';
import { Menu, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { KarnetLogo } from '@/components/shared/KarnetLogo';
import { NotificationDrawer } from '@/components/dashboard/notification-drawer';
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-[rgba(12,10,9,0.85)] backdrop-blur-xl">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü</span>
        </Button>

        {/* Logo (mobile only) */}
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <KarnetLogo size={28} />
        </Link>

        <div className="flex-1" />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationDrawer />

        {/* User menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                {user.email?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <span className="hidden sm:block max-w-[150px] truncate text-xs">
                {user.email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/settings" className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/billing" className="flex items-center gap-2 w-full">
                  Abonelik
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void logout()} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/auth">
            <Button
              size="sm"
              className="text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
            >
              Giriş Yap
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
