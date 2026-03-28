// ----------------------------------------------------------------
// Auth Callback Route
// 🔒 KORUNAN DOSYA — Hilmi onayladi, FAZ7a sonrasi degistirilemez.
// Google OAuth + email verify + password reset callback handler.
// ----------------------------------------------------------------

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/dashboard"

  // Open redirect koruması
  const safeNext = next.startsWith("/") && !next.startsWith("//") && !next.includes("://")
    ? next
    : "/dashboard"

  const supabase = await createClient()

  // OAuth flow (Google)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/auth?error=callback_failed`)
    }
    return NextResponse.redirect(`${origin}${safeNext}`)
  }

  // Email verify / magic link flow
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "recovery" | "signup" | "magiclink" | "email_change",
    })
    if (error) {
      return NextResponse.redirect(`${origin}/auth?error=verify_failed`)
    }
    return NextResponse.redirect(`${origin}${safeNext}`)
  }

  // Hicbir parametre yoksa geri yonlendir
  return NextResponse.redirect(`${origin}/auth`)
}
