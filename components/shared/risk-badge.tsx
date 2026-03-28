import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type RiskLevel = "safe" | "moderate" | "risky" | "dangerous"

const RISK_CONFIG: Record<RiskLevel, { label: string; className: string }> = {
  safe: { label: "Güvenli", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  moderate: { label: "Orta", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  risky: { label: "Riskli", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
  dangerous: { label: "Tehlikeli", className: "bg-red-100 text-red-800 hover:bg-red-100" },
}

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
  className?: string
}

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const config = RISK_CONFIG[level]

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
      {score !== undefined && ` (${score})`}
    </Badge>
  )
}
