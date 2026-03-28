'use client';

interface KarnetLogoProps {
  size?: number;
  className?: string;
}

export function KarnetLogo({ size = 36, className }: KarnetLogoProps) {
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #D97706, #92400E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 800, fontSize: size * 0.45,
        color: 'white', letterSpacing: '-0.02em',
        flexShrink: 0,
      }}
    >
      K
    </div>
  );
}
