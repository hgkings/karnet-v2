import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"

interface ProStatusCardProps {
  isPro: boolean
  planType?: string
  expiresAt?: string | null
}

export function ProStatusCard({ isPro, planType, expiresAt }: ProStatusCardProps) {
  if (isPro) {
    const expiryText = expiresAt
      ? `${new Intl.DateTimeFormat("tr-TR").format(new Date(expiresAt))} tarihine kadar`
      : "Süresiz"

    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex items-center gap-3 py-3">
          <Crown className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Pro</span>
              {planType && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                  {planType === "pro_yearly" ? "Yıllık" : "Aylık"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{expiryText}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <Crown className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Ücretsiz Plan</p>
          <p className="text-xs text-muted-foreground">Sınırlı özellikler</p>
        </div>
        <Link href="/pricing">
          <Button size="sm">Yükselt</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
