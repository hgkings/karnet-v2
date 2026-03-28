"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { createClient } from "@/lib/supabase/client"

interface ProInfo {
  isPro: boolean
  planLabel?: string
  expiresAt?: string | null
  remainingDays?: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userEmail?: string
  proInfo?: ProInfo
}

export function DashboardLayout({ children, userEmail, proInfo }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth")
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} proInfo={proInfo} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          userEmail={userEmail}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
