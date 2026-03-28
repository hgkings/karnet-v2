'use client';

import { useState } from 'react';
import { Loader2, Moon, Sun, Monitor, Shield, Bell, Sliders, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';
import { PLAN_NAMES } from '@/config/plans';
import { apiClient } from '@/lib/api/client';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const isPro = user ? isProUser(user) : false;
  const planLabel = PLAN_NAMES[user?.plan ?? 'free'] ?? 'Ücretsiz';

  // Local state for toggles
  const [emailEnabled, setEmailEnabled] = useState(user?.emailNotificationsEnabled ?? true);
  const [weeklyReport, setWeeklyReport] = useState(user?.emailWeeklyReport ?? true);
  const [riskAlert, setRiskAlert] = useState(user?.emailRiskAlert ?? true);
  const [marginAlert, setMarginAlert] = useState(user?.emailMarginAlert ?? true);
  const [proExpiry, setProExpiry] = useState(user?.emailProExpiry ?? true);
  const [fullName, setFullName] = useState(user?.fullName ?? '');

  async function handleSave() {
    setSaving(true);
    try {
      await apiClient.patch('/api/user/profile', {
        full_name: fullName,
        email_notifications_enabled: emailEnabled,
        email_weekly_report: weeklyReport,
        email_risk_alert: riskAlert,
        email_margin_alert: marginAlert,
        email_pro_expiry: proExpiry,
      });
      toast.success('Ayarlar kaydedildi.');
      void refreshUser();
    } catch {
      toast.error('Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  function applyTheme(t: 'dark' | 'light' | 'system') {
    setTheme(t);
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground text-sm">Profil, bildirim ve görünüm tercihleri</p>
      </div>

      {/* Gorunum */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" />
            Görünüm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {([
              { key: 'light' as const, icon: Sun, label: 'Açık' },
              { key: 'dark' as const, icon: Moon, label: 'Koyu' },
              { key: 'system' as const, icon: Monitor, label: 'Sistem' },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => applyTheme(key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-colors ${
                  theme === key
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-border/30 text-muted-foreground hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Plan &amp; Faturalandırma
          </CardTitle>
          <CardDescription>
            Mevcut plan: <span className="font-semibold text-foreground">{planLabel}</span>
            {isPro && user?.proExpiresAt && (
              <> &middot; Bitiş: {new Intl.DateTimeFormat('tr-TR').format(new Date(user.proExpiresAt))}</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/billing">
            <Button variant="outline" size="sm" className="text-xs">Planı Yönet</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Hesap Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Adınız Soyadınız" />
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input value={user?.email ?? ''} disabled className="opacity-60" />
          </div>
        </CardContent>
      </Card>

      {/* Email bildirimleri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            E-posta Bildirimleri
          </CardTitle>
          <CardDescription>Hangi e-postaları almak istediğinizi seçin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { label: 'Tüm Bildirimler', desc: 'Ana açma/kapama', value: emailEnabled, setter: setEmailEnabled },
            { label: 'Haftalık Rapor', desc: 'Her hafta özet e-posta', value: weeklyReport, setter: setWeeklyReport },
            { label: 'Risk Uyarısı', desc: 'Yüksek riskli ürün bildirimi', value: riskAlert, setter: setRiskAlert },
            { label: 'Marj Uyarısı', desc: 'Hedef marjın altındaki ürünler', value: marginAlert, setter: setMarginAlert },
            { label: 'Pro Bitiş Uyarısı', desc: 'Abonelik bitiş hatırlatması', value: proExpiry, setter: setProExpiry },
          ]).map(({ label, desc, value, setter }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={value} onCheckedChange={setter} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Analiz Varsayilanlari */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Analiz Varsayılanları
          </CardTitle>
          <CardDescription>Yeni analiz oluştururken kullanılacak varsayılan değerler</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Varsayılan pazaryeri, komisyon oranı ve KDV ayarları yakında eklenecek.
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }} className="text-white font-semibold">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Kaydet
      </Button>
    </div>
  );
}
