"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [done, setDone] = useState(false)
  const router = useRouter()

  function getStrength(): { label: string; color: string } {
    if (password.length < 8) return { label: "Zayıf", color: "text-red-600" }
    if (password.length < 12) return { label: "Orta", color: "text-amber-600" }
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    if (hasUpper && hasLower && hasNumber) return { label: "Güçlü", color: "text-green-600" }
    return { label: "Orta", color: "text-amber-600" }
  }

  async function handleSubmit(e: React.FormEvent) {
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
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          toast.error("Sıfırlama bağlantısının süresi dolmuş. Lütfen tekrar deneyin.")
        } else {
          toast.error("Şifre güncellenemedi. Lütfen tekrar deneyin.")
        }
        return
      }

      setDone(true)
      setTimeout(() => router.push("/auth"), 3000)
    } finally {
      setLoading(false)
    }
  }

  const strength = getStrength()

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Şifre Sıfırla</CardTitle>
          <CardDescription>
            {done ? "Şifreniz güncellendi" : "Yeni şifrenizi belirleyin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="text-sm text-muted-foreground">
                Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
              <Link href="/auth">
                <Button variant="outline">Giriş Yap</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Yeni Şifre <span className="text-destructive">*</span>
                </Label>
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
                {password.length > 0 && (
                  <p className={`text-xs ${strength.color}`}>
                    Şifre gücü: {strength.label}
                  </p>
                )}
              </div>

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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Şifreyi Güncelle
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
