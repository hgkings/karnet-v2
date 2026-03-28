'use client';

import { useState } from 'react';
import { FileText, Download, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAnalyses } from '@/hooks/use-analyses';
import { useAuth } from '@/contexts/auth-context';
import { canAccessFeature } from '@/utils/access';
import Link from 'next/link';

export default function PdfPage() {
  const { analyses, loading: analysesLoading } = useAnalyses();
  const { user } = useAuth();
  const canPdf = user ? canAccessFeature(user, 'pdfReportMonthly') : false;
  const [generating, setGenerating] = useState<string | null>(null);

  async function handleGenerate(analysisId: string) {
    if (!canPdf) {
      toast.error('PDF rapor indirmek için planınızı yükseltin.');
      return;
    }
    setGenerating(analysisId);
    try {
      const res = await fetch(`/api/pdf/analysis/${analysisId}`);
      if (res.ok) {
        toast.success('PDF rapor oluşturuldu.');
      } else {
        toast.error('PDF oluşturulamadı.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
    } finally {
      setGenerating(null);
    }
  }

  if (!canPdf) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">PDF Rapor</h1>
          <p className="text-muted-foreground text-sm">Analiz raporlarınızı PDF olarak indirin</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Pro / Starter Özellik</h3>
            <p className="text-muted-foreground text-sm mb-4">PDF rapor Starter (5/ay) ve Pro (sınırsız) planlarında kullanılabilir.</p>
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
        <h1 className="text-2xl font-bold">PDF Rapor</h1>
        <p className="text-muted-foreground text-sm">Analiz raporlarınızı PDF olarak indirin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Analizleriniz
          </CardTitle>
          <CardDescription>PDF oluşturmak istediğiniz analizi seçin</CardDescription>
        </CardHeader>
        <CardContent>
          {analysesLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {!analysesLoading && analyses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Henüz analiz yok.</p>
          )}
          {!analysesLoading && analyses.length > 0 && (
            <div className="space-y-2">
              {analyses.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/30 p-3">
                  <div>
                    <p className="text-sm font-medium">{a.product_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{a.marketplace}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={generating === a.id}
                    onClick={() => handleGenerate(a.id)}
                  >
                    {generating === a.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
                    PDF İndir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
