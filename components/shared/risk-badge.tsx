'use client';

import { cn } from '@/lib/utils';
import { RISK_LEVEL_CONFIG } from '@/utils/risk-engine';

type RiskLevel = 'safe' | 'moderate' | 'risky' | 'dangerous';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const config = RISK_LEVEL_CONFIG[level];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
      config.bgColor, config.textColor, className
    )}>
      {config.label}
      {score !== undefined && ` (${score})`}
    </span>
  );
}
