'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'profit' | 'loss';
  className?: string;
  loading?: boolean;
}

export { KPICard as KpiCard }

export function KPICard({ title, value, subtitle, icon: Icon, trend, variant, className, loading }: KPICardProps) {
  const resolvedTrend = trend ?? (variant === 'profit' ? 'up' : variant === 'loss' ? 'down' : undefined);
  const accentClass = resolvedTrend === 'up' ? 'bg-emerald-500' : resolvedTrend === 'down' ? 'bg-red-500' : 'bg-border';

  if (loading) {
    return (
      <div className={cn('flex overflow-hidden rounded-2xl border border-border/30 bg-card animate-pulse', className)}>
        <div className="w-[3px] shrink-0 bg-border" />
        <div className="flex flex-1 items-start justify-between p-6">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-7 w-28 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="rounded-xl bg-muted p-2.5 h-10 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex overflow-hidden rounded-2xl border border-border/30 bg-card hover:border-border/60 transition-colors duration-200',
      className
    )}>
      <div className={cn('w-[3px] shrink-0', accentClass)} />
      <div className="flex flex-1 items-start justify-between p-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs font-medium',
              resolvedTrend === 'up' && 'text-emerald-400',
              resolvedTrend === 'down' && 'text-red-400',
              (!resolvedTrend || resolvedTrend === 'neutral') && 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
