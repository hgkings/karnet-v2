"use client"

import Link from "next/link"
import { Bell, Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  onMenuClick?: () => void
  userEmail?: string
  onLogout?: () => void
}

export function Navbar({ onMenuClick, userEmail, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Mobil menu butonu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü</span>
        </Button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">Kârnet</span>
        </Link>

        <div className="flex-1" />

        {/* Bildirimler */}
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Bildirimler</span>
        </Link>

        {/* Kullanici menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
            <span className="sr-only">Hesap</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {userEmail && (
              <>
                <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                  {userEmail}
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>
              <Link href="/settings" className="w-full">Ayarlar</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/billing" className="w-full">Abonelik</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
