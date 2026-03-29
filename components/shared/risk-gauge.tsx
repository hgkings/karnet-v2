'use client';

import { RiskLevel } from '@/types';
import { riskLevelConfig } from '@/utils/risk-engine';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  size?: number;
}

export function RiskGauge({ score, level, size = 160 }: RiskGaugeProps) {
  const config = riskLevelConfig[level];
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          <path
            d={`M ${10} ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/50"
            strokeLinecap="round"
          />
          <path
            d={`M ${10} ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-bold" style={{ color: config.color }}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span
        className="rounded-full px-3 py-1 text-sm font-semibold"
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        {config.label}
      </span>
    </div>
  );
}
