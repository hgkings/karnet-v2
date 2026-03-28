import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">E-posta Doğrulama</CardTitle>
          <CardDescription>Hesabınızı aktifleştirmek için e-postanızı doğrulayın</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center space-y-4">
          <Mail className="h-12 w-12 text-primary" />
          <p className="text-sm text-muted-foreground">
            Kayıt olduğunuz e-posta adresine bir doğrulama bağlantısı gönderdik.
            Gelen kutunuzu (ve spam klasörünüzü) kontrol edin.
          </p>
          <Link href="/auth">
            <Button variant="outline" className="mt-4">Giriş Sayfasına Dön</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
