'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  Loader2,
  Moon,
  Sun,
  Monitor,
  Shield,
  Bell,
  Store,
  CreditCard,
  Crown,
  Mail,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Percent,
  PlusCircle,
  FileUp,
  FileText,
  Target,
  LogOut,
  Key,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { KPICard } from '@/components/shared/kpi-card';
import { useAuth } from '@/contexts/auth-context';
import { isProUser } from '@/utils/access';
import { PLAN_LIMITS, PLAN_NAMES } from '@/config/plans';
import { apiClient } from '@/lib/api/client';
import { getStoredAnalyses, deleteAnalysis } from '@/lib/api/analyses';
import { analysesToCSV, analysesToJSON } from '@/lib/csv';
import type { Analysis, Marketplace } from '@/types';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const MARKETPLACE_OPTIONS: { key: Marketplace; label: string }[] = [
  { key: 'trendyol', label: 'Trendyol' },
  { key: 'hepsiburada', label: 'Hepsiburada' },
  { key: 'amazon_tr', label: 'Amazon TR' },
  { key: 'n11', label: 'N11' },
  { key: 'custom', label: 'Diğer' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function riskBadge(level: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    safe: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Düşük' },
    moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Orta' },
    risky: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Yüksek' },
    dangerous: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Kritik' },
  };
  const m = map[level] ?? map['moderate']!;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${m.bg} ${m.text}`}
    >
      {m.label}
    </span>
  );
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ProfileUpdate = {
  email_notifications_enabled?: boolean;
  email_weekly_report?: boolean;
  email_risk_alert?: boolean;
  email_margin_alert?: boolean;
  email_pro_expiry?: boolean;
  target_margin?: number;
  margin_alert?: boolean;
  monthly_profit_target?: number;
  default_marketplace?: Marketplace;
  default_commission?: number;
  default_vat?: number;
  default_return_rate?: number;
  default_ads_cost?: number;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const isPro = user ? isProUser(user) : false;
  const planLabel = PLAN_NAMES[user?.plan ?? 'free'] ?? 'Ücretsiz';

  // — Account info —
  const [fullName, setFullName] = useState('');

  // — Notification toggles —
  const [emailEnabled, setEmailEnabled] = useState(user?.email_notifications_enabled ?? true);
  const [weeklyReport, setWeeklyReport] = useState(user?.email_weekly_report ?? true);
  const [riskAlert, setRiskAlert] = useState(user?.email_risk_alert ?? true);
  const [marginAlertEmail, setMarginAlertEmail] = useState(user?.email_margin_alert ?? true);
  const [proExpiry, setProExpiry] = useState(user?.email_pro_expiry ?? true);

  // — Profit goals —
  const [targetMargin, setTargetMargin] = useState<number>(user?.target_margin ?? 20);
  const [marginAlert, setMarginAlert] = useState<boolean>(user?.margin_alert ?? false);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(user?.monthly_profit_target ?? 0);

  // — Business defaults —
  const [defaultMp, setDefaultMp] = useState<Marketplace>(user?.default_marketplace ?? 'trendyol');
  const [defaultCommission, setDefaultCommission] = useState<number>(user?.default_commission ?? 12);
  const [defaultVat, setDefaultVat] = useState<number>(user?.default_vat ?? 20);
  const [defaultReturn, setDefaultReturn] = useState<number>(user?.default_return_rate ?? 5);
  const [defaultAds, setDefaultAds] = useState<number>(user?.default_ads_cost ?? 0);

  // — Password change —
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // — Logout all devices —
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  // — Analyses + stats —
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // — Delete dialog —
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setMounted(true), []);

  // Seed state from user when it loads
  useEffect(() => {
    if (user) {
      setFullName('');
      setEmailEnabled(user.email_notifications_enabled ?? true);
      setWeeklyReport(user.email_weekly_report ?? true);
      setRiskAlert(user.email_risk_alert ?? true);
      setMarginAlertEmail(user.email_margin_alert ?? true);
      setProExpiry(user.email_pro_expiry ?? true);
      setTargetMargin(user.target_margin ?? 20);
      setMarginAlert(user.margin_alert ?? false);
      setMonthlyTarget(user.monthly_profit_target ?? 0);
      setDefaultMp(user.default_marketplace ?? 'trendyol');
      setDefaultCommission(user.default_commission ?? 12);
      setDefaultVat(user.default_vat ?? 20);
      setDefaultReturn(user.default_return_rate ?? 5);
      setDefaultAds(user.default_ads_cost ?? 0);
    }
  }, [user]);

  // Load analyses for stats + recent activity
  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const data = await getStoredAnalyses();
        setAnalyses(data);
      } catch {
        // silently skip — stats just won't show
      } finally {
        setStatsLoaded(true);
      }
    })();
  }, [user]);

  // — Computed stats —
  const now = new Date();
  const thisMonth = analyses.filter((a) => {
    const d = new Date(a.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const profitable = analyses.filter((a) => a.result.unit_net_profit > 0).length;
  const losing = analyses.filter((a) => a.result.unit_net_profit <= 0).length;
  const avgMargin =
    analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.result.margin_pct, 0) / analyses.length
      : 0;
  const monthlyNetProfit = thisMonth.reduce(
    (sum, a) => sum + (a.result.monthly_net_profit ?? 0),
    0,
  );
  const recent5 = analyses.slice(0, 5);

  // — Generic save helper —
  const savePrefs = useCallback(
    async (updates: ProfileUpdate, successMsg = 'Tercihler kaydedildi.') => {
      if (!user) return;
      setSaving(true);
      try {
        await apiClient.patch('/api/user/profile', updates);
        toast.success(successMsg);
        void refreshUser();
      } catch {
        toast.error('Kaydetme sırasında bir hata oluştu.');
      } finally {
        setSaving(false);
      }
    },
    [user, refreshUser],
  );

  // — Main save (account info + notifications) —
  async function handleSave() {
    setSaving(true);
    try {
      await apiClient.patch('/api/user/profile', {
        email_notifications_enabled: emailEnabled,
        email_weekly_report: weeklyReport,
        email_risk_alert: riskAlert,
        email_margin_alert: marginAlertEmail,
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

  // — Password change —
  async function handlePasswordChange() {
    if (newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setPasswordLoading(true);
    try {
      // TODO: implement POST /api/user/update-password route in app/api/user/update-password/route.ts
      await apiClient.post('/api/user/update-password', { password: newPassword });
      toast.success('Şifre başarıyla değiştirildi.');
      setNewPassword('');
    } catch {
      toast.error('Şifre değiştirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setPasswordLoading(false);
    }
  }

  // — Logout all devices —
  async function handleLogoutAll() {
    setLogoutAllLoading(true);
    try {
      // TODO: implement POST /api/user/logout-all route (calls supabase signOut global scope server-side)
      await apiClient.post('/api/user/logout-all', {});
      toast.success('Tüm cihazlardan çıkış yapıldı.');
      void logout();
    } catch {
      toast.error('İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLogoutAllLoading(false);
    }
  }

  // — Export helpers —
  function handleExportCSV() {
    if (analyses.length === 0) {
      toast.error('Dışa aktarılacak analiz yok.');
      return;
    }
    downloadFile(analysesToCSV(analyses), 'karnet-analizler.csv', 'text/csv;charset=utf-8');
    toast.success('CSV dışa aktarıldı.');
  }

  function handleExportJSON() {
    if (analyses.length === 0) {
      toast.error('Dışa aktarılacak analiz yok.');
      return;
    }
    downloadFile(analysesToJSON(analyses), 'karnet-analizler.json', 'application/json');
    toast.success('JSON dışa aktarıldı.');
  }

  // — Delete all data —
  async function handleDeleteAll() {
    if (!user) return;
    setDeleting(true);
    try {
      const all = await getStoredAnalyses();
      await Promise.all(all.map((a) => deleteAnalysis(a.id)));
      setAnalyses([]);
      toast.success('Tüm analiz verileri silindi.');
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
    } catch {
      toast.error('Silme sırasında hata oluştu.');
    } finally {
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl">

      {/* ─── Page Header ─── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Görünüm, bildirim, analiz varsayılanları ve güvenlik tercihlerinizi yönetin.
        </p>
      </div>

      {/* ─── Account Summary KPIs ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Bu Ay Analiz"
          value={statsLoaded ? String(thisMonth.length) : '—'}
          icon={BarChart3}
          subtitle={statsLoaded ? `Toplam ${analyses.length}` : undefined}
        />
        <KPICard
          title="Kârlı Ürün"
          value={statsLoaded ? String(profitable) : '—'}
          icon={TrendingUp}
          trend="up"
          subtitle={
            statsLoaded && analyses.length > 0
              ? `%${Math.round((profitable / analyses.length) * 100)}`
              : undefined
          }
        />
        <KPICard
          title="Zarar Eden"
          value={statsLoaded ? String(losing) : '—'}
          icon={TrendingDown}
          trend={losing > 0 ? 'down' : 'neutral'}
          subtitle={statsLoaded && losing > 0 ? 'Dikkat!' : undefined}
        />
        <KPICard
          title="Ortalama Marj"
          value={statsLoaded ? `%${avgMargin.toFixed(1)}` : '—'}
          icon={Percent}
          trend={avgMargin > 15 ? 'up' : avgMargin > 0 ? 'neutral' : 'down'}
        />
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Hızlı İşlemler
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: PlusCircle, label: 'Yeni Analiz Başlat', href: '/analysis/new', color: 'text-blue-500' },
            { icon: FileUp, label: 'CSV İçe Aktar', href: '/products', color: 'text-emerald-500' },
            { icon: FileText, label: 'PDF Rapor Oluştur', href: '/dashboard', color: 'text-amber-500' },
            { icon: CreditCard, label: 'Fiyatlandırma', href: '/pricing', color: 'text-purple-500' },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-3 rounded-xl border bg-background p-4 hover:bg-muted/50 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] group-hover:bg-[rgba(255,255,255,0.09)] transition-colors">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-sm font-medium flex-1">{action.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 1. Appearance ─── */}
      <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Sun className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold">Görünüm</h2>
            <p className="text-xs text-muted-foreground">Tema tercihini seçin.</p>
          </div>
        </div>

        {mounted && (
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { key: 'light' as const, icon: Sun, label: 'Açık', desc: 'Aydınlık tema' },
                { key: 'dark' as const, icon: Moon, label: 'Koyu', desc: 'Karanlık tema' },
                { key: 'system' as const, icon: Monitor, label: 'Sistem', desc: 'Cihaz ayarı' },
              ] as { key: string; icon: (props: { className?: string }) => ReturnType<typeof Sun>; label: string; desc: string }[]
            ).map((opt) => {
              const active = theme === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    active
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-white/5 hover:border-[rgba(255,255,255,0.12)]'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      active ? 'bg-amber-500/10' : 'bg-[rgba(255,255,255,0.06)]'
                    }`}
                  >
                    <opt.icon
                      className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                  </div>
                  <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-foreground'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  {active && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 2. Plan & Billing ─── */}
      <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isPro ? 'bg-amber-500/10' : 'bg-muted'
              }`}
            >
              <Crown className={`h-5 w-5 ${isPro ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h2 className="font-semibold">Plan &amp; Faturalandırma</h2>
              <p className="text-xs text-muted-foreground">
                Mevcut planınızı ve ödeme detaylarınızı yönetin.
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPro
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]'
            }`}
          >
            {isPro ? 'Pro Aktif' : 'Ücretsiz Plan'}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-medium">{planLabel}</p>
            {isPro && user?.pro_expires_at && (
              <span className="text-xs text-muted-foreground">
                · Bitiş:{' '}
                {new Intl.DateTimeFormat('tr-TR').format(new Date(user.pro_expires_at))}
              </span>
            )}
          </div>

          <ul className="space-y-2 mb-4">
            {[
              { label: 'Sınırsız Analiz Geçmişi', active: isPro },
              { label: 'CSV İnceleme & Dışa Aktar', active: isPro },
              { label: 'Pazaryeri Karşılaştırma', active: isPro },
              { label: 'Gelişmiş Risk Analizi', active: isPro },
              { label: 'E-posta Bildirimleri', active: true },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    item.active ? 'text-emerald-500' : 'text-muted-foreground opacity-30'
                  }`}
                />
                <span className={item.active ? 'text-foreground' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          {!isPro ? (
            <div className="flex gap-2">
              <Link href="/pricing">
                <Button className="rounded-[10px]">Pro&apos;ya Yükselt</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="rounded-[10px]">
                  Planları Gör
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/billing">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]">
                Planı Yönet
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}

          {!isPro && (
            <p className="text-xs text-muted-foreground mt-3">
              Maksimum {PLAN_LIMITS.free.maxProducts} analiz. Pro için yükseltin.
            </p>
          )}
        </div>
      </section>

      {/* ─── 3. Email Notifications ─── */}
      <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl opacity-50" />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Mail className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold">E-posta Bildirimleri</h2>
            <p className="text-xs text-muted-foreground">
              Hangi e-postaları almak istediğinizi yönetin.
            </p>
          </div>
        </div>

        {/* Mandatory notifications */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">
            Hesap Bildirimleri
          </p>
          {[
            { label: 'Hoş geldin e-postası', desc: 'Kayıt olduğunuzda gönderilir.' },
            { label: 'E-posta doğrulama', desc: 'Hesap doğrulama linki.' },
            { label: 'Şifre sıfırlama', desc: 'Şifre sıfırlama linki.' },
            { label: 'Pro plan aktivasyonu', desc: 'Pro plan aktif olduğunda bildirim.' },
            { label: 'Pro plan sona erme', desc: 'Pro planınız sona erdiğinde bildirim.' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  {item.label}
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    Zorunlu
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={true} disabled className="opacity-50" />
            </div>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Preference notifications */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">
            Tercihli Bildirimler
          </p>

          <div className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors">
            <div>
              <p className="text-sm font-medium">Tüm Bildirimler</p>
              <p className="text-xs text-muted-foreground">Ana açma/kapama anahtarı.</p>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          {(
            [
              {
                label: 'Haftalık Özet Raporu',
                desc: 'Her hafta performans özeti e-posta ile gönderilir.',
                value: weeklyReport,
                setter: setWeeklyReport,
                key: 'email_weekly_report' as keyof ProfileUpdate,
                offMsg: 'Haftalık özet kapatıldı.',
                onMsg: 'Haftalık özet açıldı.',
              },
              {
                label: 'Zarar Eden Ürün Tespiti',
                desc: 'Zarar eden ürün tespit edildiğinde uyarı gönderir.',
                value: riskAlert,
                setter: setRiskAlert,
                key: 'email_risk_alert' as keyof ProfileUpdate,
                offMsg: 'Risk uyarısı kapatıldı.',
                onMsg: 'Risk uyarısı açıldı.',
              },
              {
                label: 'Hedef Marj Uyarısı',
                desc: 'Marj, belirlediğiniz hedefin altına düşerse uyarır.',
                value: marginAlertEmail,
                setter: setMarginAlertEmail,
                key: 'email_margin_alert' as keyof ProfileUpdate,
                offMsg: 'Marj uyarısı kapatıldı.',
                onMsg: 'Marj uyarısı açıldı.',
              },
              {
                label: 'Pro Bitiş Hatırlatıcısı',
                desc: 'Pro planınız bitmeden 7 ve 1 gün önce hatırlatma gönderir.',
                value: proExpiry,
                setter: setProExpiry,
                key: 'email_pro_expiry' as keyof ProfileUpdate,
                offMsg: 'Pro bitiş hatırlatıcısı kapatıldı.',
                onMsg: 'Pro bitiş hatırlatıcısı açıldı.',
              },
            ] as {
              label: string;
              desc: string;
              value: boolean;
              setter: (v: boolean) => void;
              key: keyof ProfileUpdate;
              offMsg: string;
              onMsg: string;
            }[]
          ).map(({ label, desc, value, setter, key, offMsg, onMsg }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={async (v) => {
                  setter(v);
                  await savePrefs({ [key]: v } as ProfileUpdate, v ? onMsg : offMsg);
                }}
              />
            </div>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Email test */}
        <div className="rounded-xl border border-border p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5">
              Sistem Testi <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </p>
            <p className="text-xs text-muted-foreground">Test e-postası gönder (Brevo SMTP)</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={async () => {
              toast.loading('Test maili gönderiliyor...', { id: 'test-email' });
              try {
                const res = await fetch('/api/email/test', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ template: 'test_email' }),
                });
                const data = (await res.json()) as { provider_message_id?: string; error?: string };
                if (res.ok) {
                  toast.success(`Başarılı! (ID: ${data.provider_message_id})`, { id: 'test-email' });
                } else {
                  toast.error(`Hata: ${data.error}`, { id: 'test-email' });
                }
              } catch {
                toast.error('Bağlantı hatası.', { id: 'test-email' });
              }
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Test Gönder
          </Button>
        </div>
      </section>

      {/* ─── 4. Profit Goals ─── */}
      <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Kâr Hedefi</h2>
            <p className="text-xs text-muted-foreground">
              Hedef marjınızı belirleyin, altına düşünce uyarı alın.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Hedef Net Marj</Label>
              <span className="text-lg font-bold text-primary tabular-nums">
                %{targetMargin}
              </span>
            </div>
            <Slider
              value={[targetMargin]}
              onValueChange={(val) =>
                setTargetMargin(Array.isArray(val) ? (val[0] ?? 20) : val)
              }
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>%0</span>
              <span>%50</span>
              <span>%100</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-medium">Marj hedefin altına düşerse uyar</p>
              <p className="text-xs text-muted-foreground">
                Bildirim ve e-posta ile uyarı gönderilir.
              </p>
            </div>
            <Switch checked={marginAlert} onCheckedChange={setMarginAlert} />
          </div>

          {/* Monthly Profit Target */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hedef Aylık Kâr (₺)</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={monthlyTarget || ''}
                  onChange={(e) => setMonthlyTarget(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={100}
                  placeholder="5000"
                  className="h-10 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₺
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dashboard&apos;da hedefe ne kadar yaklaştığını gösterir.
              </p>
            </div>

            {statsLoaded && monthlyTarget > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Bu Ay Toplam Net Kâr</span>
                  <span
                    className={`font-bold tabular-nums ${
                      monthlyNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(monthlyNetProfit)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      monthlyNetProfit >= monthlyTarget
                        ? 'bg-emerald-500'
                        : monthlyNetProfit >= monthlyTarget * 0.5
                          ? 'bg-amber-500'
                          : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, (monthlyNetProfit / monthlyTarget) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    %{Math.round(Math.max(0, (monthlyNetProfit / monthlyTarget) * 100))} tamamlandı
                  </span>
                  <span>Hedef: {formatCurrency(monthlyTarget)}</span>
                </div>
              </div>
            )}
          </div>

          <Button
            size="sm"
            disabled={saving}
            onClick={() =>
              void savePrefs(
                {
                  target_margin: targetMargin,
                  margin_alert: marginAlert,
                  monthly_profit_target: monthlyTarget,
                },
                'Hedef kaydedildi.',
              )
            }
            className="rounded-[10px]"
          >
            {saving ? 'Kaydediliyor...' : 'Hedefi Kaydet'}
          </Button>
        </div>
      </section>

      {/* ─── 5. Analysis Defaults ─── */}
      <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Store className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold">Analiz Varsayılanları</h2>
            <p className="text-xs text-muted-foreground">
              &quot;Yeni Analiz&quot; formunda otomatik doldurulacak değerler.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-sm font-medium">Varsayılan Pazaryeri</Label>
            <select
              value={defaultMp}
              onChange={(e) => setDefaultMp(e.target.value as Marketplace)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {MARKETPLACE_OPTIONS.map((mp) => (
                <option key={mp.key} value={mp.key}>
                  {mp.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Komisyon Oranı</Label>
            <div className="relative">
              <Input
                type="number"
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                className="h-10 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">KDV Oranı</Label>
            <div className="relative">
              <Input
                type="number"
                value={defaultVat}
                onChange={(e) => setDefaultVat(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                className="h-10 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">İade Oranı</Label>
            <div className="relative">
              <Input
                type="number"
                value={defaultReturn}
                onChange={(e) => setDefaultReturn(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                className="h-10 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Reklam Maliyeti</Label>
            <div className="relative">
              <Input
                type="number"
                value={defaultAds}
                onChange={(e) => setDefaultAds(parseFloat(e.target.value) || 0)}
                min={0}
                className="h-10 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₺
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            disabled={saving}
            className="rounded-[10px]"
            onClick={() =>
              void savePrefs(
                {
                  default_marketplace: defaultMp,
                  default_commission: defaultCommission,
                  default_vat: defaultVat,
                  default_return_rate: defaultReturn,
                  default_ads_cost: defaultAds,
                },
                'Varsayılanlar kaydedildi.',
              )
            }
          >
            {saving ? 'Kaydediliyor...' : 'Varsayılanları Kaydet'}
          </Button>
          <Link href="/settings/commission-rates" className="text-xs text-primary hover:underline">
            Komisyon oranlarını görüntüle →
          </Link>
        </div>
      </section>

      {/* ─── 6. Account Info ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Hesap Bilgileri
          </CardTitle>
          <CardDescription>Ad ve bildirim tercihlerinizi buradan kaydedin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Adınız Soyadınız"
            />
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input value={user?.email ?? ''} disabled className="opacity-60" />
          </div>
          <Button
            onClick={() => void handleSave()}
            disabled={saving}
            style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
            className="text-white font-semibold"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </CardContent>
      </Card>

      {/* ─── 7. Security ─── */}
      <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold">Hesap Güvenliği</h2>
            <p className="text-xs text-muted-foreground">
              Giriş yöntemlerinizi ve oturum güvenliğinizi yönetin.
            </p>
          </div>
        </div>

        {/* Profile info */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">E-posta Adresi</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Key className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">Kimlik Doğrulama</p>
              <span className="inline-flex items-center gap-1 rounded-full border bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] font-medium">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                E-posta
              </span>
            </div>
          </div>
        </div>

        {/* Password change */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
          <p className="text-sm font-medium">Şifre Değiştir</p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Yeni şifre (min 6 karakter)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 flex-1"
            />
            <Button
              size="sm"
              disabled={passwordLoading || newPassword.length < 6}
              onClick={() => void handlePasswordChange()}
              className="rounded-[10px] h-10"
            >
              {passwordLoading ? 'Değiştiriliyor...' : 'Değiştir'}
            </Button>
          </div>
        </div>

        {/* Session actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10 rounded-[10px]"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            Oturumu Kapat
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={logoutAllLoading}
            className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10 rounded-[10px]"
            onClick={() => void handleLogoutAll()}
          >
            <LogOut className="h-4 w-4" />
            {logoutAllLoading ? 'İşleniyor...' : 'Tüm Cihazlardan Çıkış'}
          </Button>
        </div>
      </section>

      {/* ─── 8. Data Management ─── */}
      <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <Database className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h2 className="font-semibold">Veri Yönetimi</h2>
            <p className="text-xs text-muted-foreground">{analyses.length} analiz kaydınız var.</p>
          </div>
        </div>

        {/* Export */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
          <p className="text-sm font-medium">Verileri Dışa Aktar</p>
          <p className="text-xs text-muted-foreground">
            Tüm analizlerinizi CSV veya JSON formatında indirin.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-[10px]"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4" />
              CSV İndir
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-[10px]"
              onClick={handleExportJSON}
            >
              <Download className="h-4 w-4" />
              JSON İndir
            </Button>
          </div>
        </div>

        {/* Delete all */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-sm font-medium text-red-400">Tehlikeli Bölge</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Tüm analiz geçmişinizi ve kaydedilen ürün verilerinizi kalıcı olarak silebilirsiniz.
            Bu işlem geri alınamaz.
          </p>
          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(v) => {
              setDeleteDialogOpen(v);
              if (!v) setDeleteConfirmText('');
            }}
          >
            <DialogTrigger>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10 rounded-[10px]"
              >
                <Trash2 className="h-4 w-4" />
                Tüm Verileri Sil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Tüm Verileri Sil
                </DialogTitle>
                <DialogDescription>
                  Bu işlem tüm analizlerinizi kalıcı olarak silecek. Onaylamak için aşağıya{' '}
                  <strong>KARNET</strong> yazın.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Input
                  placeholder='Onaylamak için "KARNET" yazın'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="font-mono"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={deleting}
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void handleDeleteAll()}
                  disabled={deleting || deleteConfirmText !== 'KARNET'}
                >
                  {deleting ? 'Siliniyor...' : 'Evet, Tümünü Sil'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* ─── 9. Recent Analyses ─── */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Son Analizler
          </h2>
          {analyses.length > 5 && (
            <Link href="/dashboard" className="text-xs text-primary hover:underline">
              Tümünü Gör
            </Link>
          )}
        </div>

        {recent5.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Henüz analiz yok.</p>
            <Link href="/analysis/new" className="text-xs text-primary mt-1 hover:underline">
              İlk analizinizi oluşturun →
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recent5.map((a) => (
              <Link key={a.id} href={`/analysis/${a.id}`}>
                <div className="flex items-center gap-4 rounded-xl p-3 -mx-1 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      a.result.unit_net_profit > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    {a.result.unit_net_profit > 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {a.input.product_name || 'İsimsiz Ürün'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(a.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        a.result.unit_net_profit > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(a.result.unit_net_profit)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        %{a.result.margin_pct.toFixed(1)}
                      </span>
                      {riskBadge(a.risk.level)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
