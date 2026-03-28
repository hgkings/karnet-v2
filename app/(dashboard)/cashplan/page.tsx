'use client';

import { Wallet, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';

export default function CashPlanPage() {
  const { user } = useAuth();
  const isPro = user ? isProUser(user) : false;

  if (!isPro) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Nakit Planı</h1>
          <p className="text-muted-foreground text-sm">Aylık nakit akış planlaması</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Pro Özellik</h3>
            <p className="text-muted-foreground text-sm mb-4">Nakit akış planlaması Pro planında kullanılabilir.</p>
            <Link href="/billing">
              <Button style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }} className="text-white font-semibold">
                Planınızı Yükseltin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Nakit Planı</h1>
        <p className="text-muted-foreground text-sm">Aylık nakit akış planlaması</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Nakit Akış Tablosu
          </CardTitle>
          <CardDescription>Ürünlerinizin aylık nakit akış etkisi</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nakit akış planlaması yakında aktif olacak. Ürün analizleriniz üzerinden otomatik hesaplanacak.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
