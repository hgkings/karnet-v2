import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

export interface ProLockedSectionProps {
  featureName?: string
  title?: string
  children: React.ReactNode
}

export function ProLockedSection({ featureName, title, children }: ProLockedSectionProps) {
  const displayName = title ?? featureName ?? 'Bu özellik';
  return (
    <div className="relative">
      {/* Bulanik icerik */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Yukseltme overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-base mb-1">{displayName}</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center px-4">
          Bu özellik Pro planında kullanılabilir.
        </p>
        <Link href="/pricing">
          <Button>Planınızı Yükseltin</Button>
        </Link>
      </div>
    </div>
  )
}
