# FAZ1 — Proje İskeleti
> Ön koşul: Yeni repo oluşturuldu (karnet-v2), .claude/ klasörü dolduruldu
> Hedef: Doğru klasör yapısı ve config ile çalışan Next.js 15 projesi
> Bu fazda oku: ENV-TEMPLATE.md, ERROR-REPORT.md (sadece referans)
> Son güncelleme: 2026-03-28

---

## SPEC (Hilmi'ye sun, onay al, sonra başla)

```
TASK: Proje iskeletini başlat
LAYERS: Sadece altyapı — iş mantığı yok
FILES TO CREATE:
  - package.json (Next.js 15, TypeScript, Tailwind, shadcn)
  - tsconfig.json (strict mode)
  - next.config.ts (CSP headers, güvenlik)
  - tailwind.config.ts
  - .env.example (ENV-TEMPLATE.md'den)
  - .gitignore
  - .eslintrc.json
  - app/layout.tsx (root layout)
  - app/page.tsx (placeholder landing)
  - Tüm boş klasörler (.gitkeep ile)
FILES NOT TOUCHED: Hiçbir şey — bu sıfırdan bir repo
APPROACH: İskelet oluştur, bağımlılıkları kur, TypeScript'in derlendiğini doğrula
RISK: Node versiyonu uyumsuzluğu — Node 20+ gerekli
→ Awaiting approval.
```

---

## OLUŞTURULACAK KLASÖR YAPISI

```
karnet-v2/
├── .claude/
│   ├── CLAUDE.md
│   ├── MASTER.md
│   ├── PIPELINE.md
│   ├── PROMPT-RULES.md
│   ├── ENV-TEMPLATE.md
│   ├── COMPONENT-GUIDE.md
│   ├── KNOWLEDGE-BASE.md
│   ├── DATABASE-SCHEMA.md
│   ├── ERROR-REPORT.md
│   ├── faz1-skeleton.md
│   ├── faz2-infrastructure.md
│   ├── faz3-gateway.md
│   ├── faz4-services.md
│   ├── faz5-repository.md
│   ├── faz6-api.md
│   ├── faz7-ui.md
│   └── faz8-payment.md
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (marketing)/
│   ├── admin/
│   ├── api/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── features/
│   └── shared/
├── lib/
│   ├── validators/schemas/
│   ├── gateway/
│   ├── db/
│   ├── supabase/
│   ├── security/
│   ├── email/templates/
│   └── api/
├── services/
├── repositories/
├── types/
├── supabase/migrations/
├── supabase/functions/
├── .env.example
├── .env.local         ← ASLA git'e commit etme
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## GEREKLİ AYARLAR

### TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "module": "esnext",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  }
}
```

### Next.js Güvenlik Headers (next.config.ts)
v1'deki `next.config.js` CSP politikasını referans al.
Şunları ekle: `Content-Security-Policy`, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy`, `Strict-Transport-Security`.

### ESLint
- `@typescript-eslint` strict kuralları
- `no-explicit-any` kuralı aktif
- Import sırası kuralları

### .gitignore (zorunlu girişler)
```
.env.local
.env
.env*.local
node_modules/
.next/
```

---

## BAĞIMLILIKLAR

### Production
```json
{
  "next": "15.x",
  "react": "^19",
  "react-dom": "^19",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@supabase/supabase-js": "^2",
  "@supabase/ssr": "^0",
  "zod": "^3",
  "@upstash/ratelimit": "^2",
  "@upstash/redis": "^1",
  "nodemailer": "^6",
  "pdf-lib": "^1",
  "@pdf-lib/fontkit": "^1"
}
```

### shadcn/ui Bileşenleri (kurmak için: npx shadcn@latest add)
```
button, card, input, label, form, select, dialog, alert-dialog,
sheet, toast, table, tabs, badge, skeleton, separator,
dropdown-menu, popover, switch, slider, textarea, checkbox
```

---

## TESLİMAT KRITERLERI

FAZ1 şu durumda tamamlandı sayılır:
- [ ] `npm run dev` hatasız başlıyor
- [ ] `tsc --noEmit` sıfır hatayla geçiyor
- [ ] Tüm klasörler oluşturuldu (boş olsa bile .gitkeep ile)
- [ ] `.env.local` oluşturuldu (commit edilmedi)
- [ ] `.env.example` boş değerlerle commit edildi
- [ ] İlk commit GitHub'a push edildi
- [ ] Vercel repo'ya bağlandı (otomatik deploy ayarlandı)
- [ ] Vercel'e tüm env variable'lar eklendi

---

## SELF-REVIEW

```
□ TypeScript derleniyor mu? (tsc --noEmit)
□ npm run dev başlıyor mu?
□ .env.local .gitignore'da mı?
□ CSP headers next.config.ts'de var mı?
□ tsconfig.json'da strict: true var mı?
□ Tüm boş klasörler oluşturuldu mu?
□ .env.example değerler boş olarak commit edildi mi?
```

---

## FAZ1 RAPOR FORMATI

```
FAZ1 TAMAMLANDI
Teslim edilenler: [ne yapıldı listesi]
Bulunan sorunlar: [varsa sorunlar]
Sonraki: FAZ2 — Altyapı
```
