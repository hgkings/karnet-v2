import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ----------------------------------------------------------------
// Next.js Middleware — Auth guard + session refresh
// 🔒 Bu dosya FAZ2 sonrasi korunur. Degisiklik icin Hilmi onayı gerekli.
// ----------------------------------------------------------------

const PUBLIC_ROUTES = new Set([
  '/',
  '/auth',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/pricing',
  '/demo',
  '/blog',
  '/hakkimizda',
  '/iletisim',
  '/gizlilik-politikasi',
  '/mesafeli-satis-sozlesmesi',
  '/iade-politikasi',
  '/kullanim-sartlari',
  '/support',
  '/hata',
])

function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (PUBLIC_ROUTES.has(pathname)) return true

  // /blog/[slug] — tum blog yazilari public
  if (pathname.startsWith('/blog/')) return true

  return false
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  )
}

function isPaytrRoute(pathname: string): boolean {
  // PayTR callback'leri auth gerektirmez
  return pathname.startsWith('/api/paytr/')
}

function isAuthCallback(pathname: string): boolean {
  return pathname === '/auth/callback'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Statik dosyalar — atla
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // PayTR callback — kimliksiz erisim gerektirir
  if (isPaytrRoute(pathname)) {
    return NextResponse.next()
  }

  // Auth callback — Supabase auth flow
  if (isAuthCallback(pathname)) {
    return NextResponse.next()
  }

  // Session refresh — her istekte cookie'leri guncelle
  const { user, supabaseResponse } = await updateSession(request)

  // Public route — session refresh yap ama engelleme
  if (isPublicRoute(pathname)) {
    return supabaseResponse
  }

  // Korunmus route — session yoksa login'e yonlendir
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Next.js internals ve statik dosyalar haric her seyi yakala:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
