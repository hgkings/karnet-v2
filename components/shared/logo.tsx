'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'default' | 'large';
  className?: string;
}

export function Logo({ size = 'default', className }: LogoProps) {
  const isLarge = size === 'large';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center font-extrabold text-white shrink-0',
          isLarge
            ? 'w-11 h-11 rounded-xl text-lg'
            : 'w-[34px] h-[34px] rounded-[9px] text-sm'
        )}
        style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
      >
        K
      </div>
      <span
        className={cn(
          'font-bold text-foreground',
          isLarge ? 'text-[26px]' : 'text-[19px]'
        )}
        style={{ letterSpacing: '-0.5px' }}
      >
        Kârnet
      </span>
    </div>
  );
}
