'use client';

import Link from 'next/link';
import { Crown } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/30 rounded-2xl p-8 max-w-sm mx-4 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-amber-500/10">
          <Crown className="h-7 w-7 text-amber-400" />
        </div>
        <h3 className="text-lg font-bold">Pro Özellik</h3>
        <p className="text-sm text-muted-foreground">
          {feature ? `${feature} özelliği` : 'Bu özellik'} Pro planında kullanılabilir.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link href="/pricing" onClick={onClose}>
            <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>
              Planları İncele
            </button>
          </Link>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
