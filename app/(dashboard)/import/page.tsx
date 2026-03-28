'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { canAccessFeature } from '@/utils/access';
import Link from 'next/link';

export default function ImportPage() {
  const { user } = useAuth();
  const canImport = user ? canAccessFeature(user, 'csvImport') : false;
  const [csvContent, setCsvContent] = useState('');
  const [importing, setImporting] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvContent(text);
  }

  async function handleImport() {
    if (!csvContent.trim()) {
      toast.error('CSV içeriği boş.');
      return;
    }
    setImporting(true);
    try {
      toast.success('CSV import özelliği yakında aktif olacak.');
    } finally {
      setImporting(false);
    }
  }

  if (!canImport) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">CSV İçe Aktar</h1>
          <p className="text-muted-foreground text-sm">Toplu ürün yükleme</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Starter / Pro Özellik</h3>
            <p className="text-muted-foreground text-sm mb-4">CSV içe aktarma Starter ve Pro planlarında kullanılabilir.</p>
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
        <h1 className="text-2xl font-bold">CSV İçe Aktar</h1>
        <p className="text-muted-foreground text-sm">Toplu ürün yükleme</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            CSV Yükle
          </CardTitle>
          <CardDescription>CSV dosyanızı yükleyin veya içeriği yapıştırın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="text-sm" />
          </div>
          <Textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="Ürün Adı;Satış Fiyatı;Maliyet;Komisyon %&#10;Örnek Ürün;199.90;85.00;18"
            rows={8}
          />
          <Button onClick={handleImport} disabled={importing} style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }} className="text-white font-semibold">
            {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            İçe Aktar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
