"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Skeleton className="h-[500px] w-full max-w-md rounded-xl" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/dashboard"

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes("Invalid login")) {
          toast.error("E-posta veya şifre hatalı.")
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("E-postanızı doğrulamanız gerekiyor. Gelen kutunuzu kontrol edin.")
        } else if (error.status === 429) {
          toast.error("Çok fazla deneme yaptınız. Lütfen bekleyin.")
        } else {
          toast.error("Giriş yapılamadı. Lütfen tekrar deneyin.")
        }
        return
      }
      router.push(next)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.")
      return
    }
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalıdır.")
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Bu e-posta adresi zaten kayıtlı.")
        } else {
          toast.error("Kayıt oluşturulamadı. Lütfen tekrar deneyin.")
        }
        return
      }
      toast.success("Hesabınız oluşturuldu!")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-primary mb-2 block">
            Kârnet
          </Link>
          <CardTitle className="text-xl">
            {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Hesabınıza giriş yapın"
              : "Ücretsiz hesap oluşturun"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            type="button"
          >
            Google ile {isLogin ? "Giriş Yap" : "Kaydol"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">veya</span>
            </div>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Ad Soyad <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                E-posta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Şifre <span className="text-destructive">*</span>
                </Label>
                {isLogin && (
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Şifremi Unuttum
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 8 karakter"
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Şifre Tekrar <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isLogin ? (
              <>
                Hesabınız yok mu?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-primary hover:underline font-medium"
                  type="button"
                >
                  Kaydol
                </button>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-primary hover:underline font-medium"
                  type="button"
                >
                  Giriş Yap
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
