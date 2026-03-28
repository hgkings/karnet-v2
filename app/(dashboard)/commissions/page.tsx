'use client';

import { useState } from 'react';
import { Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COMMISSION_DATA: Record<string, Array<{ category: string; rate: number }>> = {
  trendyol: [
    { category: 'Elektronik', rate: 8 }, { category: 'Bilgisayar & Tablet', rate: 8 },
    { category: 'Telefon & Aksesuar', rate: 10 }, { category: 'Beyaz Eşya', rate: 10 },
    { category: 'Kozmetik & Kişisel Bakım', rate: 14 }, { category: 'Ev & Yaşam', rate: 14 },
    { category: 'Süpermarket & Gıda', rate: 5 }, { category: 'Spor & Outdoor', rate: 18 },
    { category: 'Giyim & Moda', rate: 20 }, { category: 'Ayakkabı & Çanta', rate: 20 },
    { category: 'Anne & Bebek', rate: 12 }, { category: 'Oyuncak & Hobi', rate: 14 },
    { category: 'Kitap & Kırtasiye', rate: 10 }, { category: 'Otomotiv & Motosiklet', rate: 12 },
    { category: 'Diğer', rate: 14 },
  ],
  hepsiburada: [
    { category: 'Elektronik', rate: 9 }, { category: 'Bilgisayar', rate: 9 },
    { category: 'Telefon', rate: 10 }, { category: 'Beyaz Eşya', rate: 10 },
    { category: 'Kozmetik', rate: 15 }, { category: 'Ev & Yaşam', rate: 13 },
    { category: 'Süpermarket', rate: 8 }, { category: 'Giyim', rate: 18 },
    { category: 'Ayakkabı', rate: 18 }, { category: 'Anne & Bebek', rate: 13 },
    { category: 'Spor', rate: 15 }, { category: 'Kitap', rate: 10 },
    { category: 'Diğer', rate: 13 },
  ],
  n11: [
    { category: 'Elektronik', rate: 8 }, { category: 'Bilgisayar', rate: 8 },
    { category: 'Telefon', rate: 10 }, { category: 'Beyaz Eşya', rate: 10 },
    { category: 'Kozmetik', rate: 14 }, { category: 'Ev & Yaşam', rate: 12 },
    { category: 'Süpermarket', rate: 8 }, { category: 'Giyim', rate: 16 },
    { category: 'Ayakkabı', rate: 16 }, { category: 'Anne & Bebek', rate: 12 },
    { category: 'Diğer', rate: 12 },
  ],
  amazon_tr: [
    { category: 'Elektronik', rate: 7 }, { category: 'Bilgisayar', rate: 7 },
    { category: 'Telefon', rate: 8 }, { category: 'Beyaz Eşya', rate: 8 },
    { category: 'Kozmetik', rate: 12 }, { category: 'Ev & Yaşam', rate: 12 },
    { category: 'Süpermarket', rate: 8 }, { category: 'Giyim', rate: 15 },
    { category: 'Ayakkabı', rate: 15 }, { category: 'Anne & Bebek', rate: 10 },
    { category: 'Spor', rate: 12 }, { category: 'Diğer', rate: 12 },
  ],
};

const MARKETPLACE_LABELS: Record<string, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  n11: 'n11',
  amazon_tr: 'Amazon TR',
};

export default function CommissionsPage() {
  const [marketplace, setMarketplace] = useState('trendyol');
  const rates = COMMISSION_DATA[marketplace] ?? [];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Komisyon Oranları</h1>
        <p className="text-muted-foreground text-sm">Pazaryeri bazlı varsayılan komisyon oranları</p>
      </div>

      <Select value={marketplace} onValueChange={(v) => { if (v) setMarketplace(v); }}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(MARKETPLACE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            {MARKETPLACE_LABELS[marketplace]} Komisyon Oranları
          </CardTitle>
          <CardDescription>Kategori bazlı varsayılan oranlar (kullanıcı özelleştirmesi yakında)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Komisyon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((r) => (
                  <TableRow key={r.category}>
                    <TableCell className="text-sm">{r.category}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-primary">%{r.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {marketplace === 'n11' && (
            <p className="text-xs text-muted-foreground mt-3">
              n11 ek ücreti: %1.87 (pazarlama %1.20 + pazaryeri %0.67) — KDV dahil fiyat üzerinden
            </p>
          )}
          {marketplace === 'amazon_tr' && (
            <p className="text-xs text-muted-foreground mt-3">
              Amazon TR: Tüm kategorilerde iade oranına +%3 eklenir (koşulsuz iade politikası)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
