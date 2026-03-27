# KNOWLEDGE BASE — Kârnet

Kârnet is a Turkish e-commerce profitability analysis SaaS application. It helps online sellers calculate net profit, assess risk, and manage their marketplace operations across Trendyol, Hepsiburada, n11, and Amazon TR. Built with Next.js (App Router), Supabase (PostgreSQL + Auth), and deployed on Vercel.

Domain: `www.kârnet.com` (punycode: `www.xn--krnet-3qa.com`)

---

## 1. PROFIT CALCULATION ENGINE

The profit calculation lives in `utils/calculations.ts` (standard mode) and `utils/pro-accounting.ts` (PRO mode with granular VAT).

### Step-by-Step Formula (Standard Mode)

**Step 1 — Extract VAT from sale price:**
The sale price entered by the user is assumed to include VAT. The system strips VAT to get the base price.

- VAT Rate = `vat_pct / 100` (default: 20%)
- Sale Price Excluding VAT = `sale_price / (1 + VAT_rate)`
- VAT Amount = `sale_price - sale_price_excl_vat`

**Step 2 — Calculate commission:**
Turkish marketplaces charge commission on the VAT-exclusive price. n11 has additional fees calculated on the VAT-inclusive price.

- Commission Amount = `sale_price_excl_vat × (commission_pct / 100) + sale_price × (n11_extra_pct / 100)`

The `n11_extra_pct` is 0 for all marketplaces except n11, where it is 1.87% (1.20% marketing + 0.67% marketplace fee).

**Step 3 — Calculate expected return loss:**
- Expected Return Loss = `(return_rate_pct / 100) × sale_price`

This represents the average revenue lost per unit due to returns, spread across all sales.

**Step 4 — Calculate platform service fee:**
A fixed per-order fee charged by the marketplace. Only applies to Trendyol and Hepsiburada, not to n11 (included in n11_extra_pct) or Amazon TR (zero).

- Trendyol default: 8.49 TL per order
- Hepsiburada default: 9.50 TL per order
- n11: 0 (included in extra percentage)
- Amazon TR: 0
- Custom: 0

**Step 5 — Calculate unit variable cost:**
- Unit Variable Cost = `product_cost + shipping_cost + packaging_cost + ad_cost_per_sale + other_cost + service_fee_amount`

**Step 6 — Calculate unit total cost:**
- Unit Total Cost = `unit_variable_cost + commission_amount + vat_amount + expected_return_loss`

**Step 7 — Calculate unit net profit:**
- Unit Net Profit = `sale_price - unit_total_cost`

**Step 8 — Calculate net profit margin:**
- Margin % = `(unit_net_profit / sale_price) × 100`

**Step 9 — Calculate monthly aggregates:**
- Monthly Net Profit = `unit_net_profit × monthly_sales_volume`
- Monthly Revenue = `sale_price × monthly_sales_volume`
- Monthly Total Cost = `unit_total_cost × monthly_sales_volume`

### Breakeven Price Calculation

The minimum sale price needed to avoid losses:

- base_cost = product_cost + shipping + packaging + ads + other + service_fee + (return_extra_cost × return_rate)
- vat_factor = 1 / (1 + vat_pct / 100)
- return_factor = return_rate_pct / 100
- denominator = vat_factor × (1 - commission_pct / 100) - (n11_extra_pct / 100) - return_factor
- **Breakeven Price = base_cost / denominator**

If denominator ≤ 0, the breakeven price is Infinity (impossible to profit at any price with current cost structure).

### Required Price for Target Margin

- For a target margin rate: required_price = base_cost / (denominator - target_margin_rate)
- For a target profit per unit: required_price = (target_profit + base_cost) / denominator

### Ad Ceiling Calculation

Maximum ad spend before reaching breakeven: Calculate profit with zero ad cost, and the resulting unit_net_profit IS the maximum ad budget per sale.

### Cashflow Impact Calculation

- Unit Cash Out = product_cost + shipping + packaging + other + ads
- Monthly Outflow = unit_cash_out × volume
- Daily Outflow = monthly_outflow / 30
- Working Capital Needed = daily_outflow × payout_delay_days
- Monthly Inflow = revenue - (commission + service_fee + vat) × volume
- Monthly Cash Gap = monthly_outflow - (monthly_inflow × (30 - payout_delay_days) / 30)

### PRO Accounting Mode (Granular VAT)

Available only to Pro plan users. Each cost component can have its own VAT rate and a flag indicating whether the entered amount includes VAT or not. This enables proper Turkish accounting with separate Output VAT (collected on sales) and Input VAT (deductible on purchases).

Key differences from standard mode:
- Tracks Output VAT (collected from customers on sales) and Input VAT (paid on purchases, deductible)
- Calculates monthly VAT position: Output VAT - Input VAT. Positive means money owed to the government; negative means a refund is due.
- Return loss calculation considers whether marketplace refunds commission on returned items (configurable per analysis)
- Each cost line (product, shipping, packaging, ads, other, commission) can have a separate VAT rate

### Sensitivity Analysis (10 Scenarios)

The system recalculates profit for each scenario and shows the difference:
1. Price +5%
2. Price +10%
3. Price -5%
4. Price -10%
5. Commission +2 percentage points
6. Commission -2 percentage points
7. Ad cost +5 TL per sale
8. Ad cost +10 TL per sale
9. Return rate doubled (capped at 100%)
10. Sales volume +20%

### Edge Cases and Special Rules

- Negative margin is allowed but flagged with warnings and risk alerts
- All division operations check for zero denominator
- N11 extra fees are applied as a percentage on the VAT-inclusive price, on top of the base commission
- Service fee is NOT applied to n11 (already included in n11_extra_pct)
- Return loss assumes full refund of the entire order value
- Payout delay only affects working capital calculation, not profit
- Number inputs are sanitized via a helper function that converts comma-separated strings to decimals and handles null/undefined

---

## 2. RISK SCORING SYSTEM

The risk engine lives in `utils/risk-engine.ts`. It produces a score from 0 to 100 and a risk level.

### Score Components (Total: 100 points)

**Margin Score (0–40 points):**
- Margin ≥ 20%: 40 points
- Margin 10–20%: 20 + ((margin - 10) / 10) × 20 points (linear interpolation)
- Margin 0–10%: (margin / 10) × 20 points
- Margin < 0%: 0 points
- Risk factor triggered when margin < 10% ("Düşük Kar Marjı" — Low Profit Margin)

**Return Rate Score (0–20 points):**
- Return rate ≤ 5%: 20 points
- Return rate 5–15%: 20 - ((return_rate - 5) / 10) × 10 points
- Return rate > 15%: max(0, 10 - ((return_rate - 15) / 10) × 10) points
- Risk factor triggered when return rate > 10% ("Yüksek İade Oranı" — High Return Rate)

**Ad Dependency Score (0–20 points):**
- Ad ratio = (ad_cost_per_sale / sale_price) × 100
- Ad ratio ≤ 3%: 20 points
- Ad ratio 3–10%: 20 - ((ad_ratio - 3) / 7) × 10 points
- Ad ratio > 10%: max(0, 10 - ((ad_ratio - 10) / 10) × 10) points
- Risk factor triggered when ad ratio > 10% ("Reklam Bağımlılığı" — Ad Dependency)

**Commission Score (0–20 points):**
- Commission ≤ 12%: 20 points
- Commission 12–20%: 20 - ((commission - 12) / 8) × 10 points
- Commission > 20%: max(0, 10 - ((commission - 20) / 10) × 10) points
- Risk factor triggered when commission > 20% ("Yüksek Komisyon" — High Commission)

### Risk Levels

| Score     | Level       | Turkish         | Color  |
|-----------|-------------|-----------------|--------|
| ≥ 80      | safe        | Güvenli         | Green  |
| 60–79     | moderate    | Orta            | Amber  |
| 40–59     | risky       | Riskli          | Orange |
| < 40      | dangerous   | Tehlikeli       | Red    |

### Risk Alert Email

A risk alert email is sent when:
- risk_score ≥ 70 OR risk_level contains "High", "Critical", or "Tehlikeli"
- User has `email_risk_alert` preference enabled
- At least 6 hours have passed since the last risk alert for this user

---

## 3. MARKETPLACE INTEGRATIONS

### Trendyol

**Status:** Fully integrated with live API connection.

**API Connection:**
- Base URL: `https://api.trendyol.com/sapigw` (production)
- Order API: `https://apigw.trendyol.com/integration/order/sellers/{sellerId}`
- Product API: `https://apigw.trendyol.com/integration/product/sellers/{sellerId}`
- Claims API: `https://apigw.trendyol.com/integration/claim/sellers/{sellerId}`
- Authentication: HTTP Basic Auth with base64-encoded `apiKey:apiSecret`
- Required credentials: `apiKey`, `apiSecret`, `sellerId`

**Data Fetched:**
- Products: id, barcode, title, salePrice, listPrice, stockCount, categoryName, stockCode (filtered to approved=true only)
- Orders: orderId, orderDate, status, totalPrice, commission, cargoPrice, netEarning, order lines (sorted by PackageLastModifiedDate DESC)
- Unsupplied Orders: Orders with "UnSupplied" status (special query without date range)
- Commission Rates: By category ID with dynamic percentages
- Settlements: Monthly financial settlements (13+ day windowing)
- Claims/Returns: Return lines with reason, quantity, amount, date

**Rate Limits:**
- Standard API: 45 requests per 10 seconds (actual limit is 50; client uses 45 for safety)
- Order API: 900 requests per 60 seconds (actual limit is 1000)
- On 429 response: Fixed 12-second wait, then up to 3 retries
- On 5xx errors: Exponential backoff (1s, 2s, 4s)
- Request timeout: 10 seconds

**Date Windowing:** Orders are queried in maximum 13-day windows. Settlements use 30-day windows.

**Service Fee Defaults:**
- Commission: Category-based (8% for Elektronik up to 20% for Giyim & Moda), default 18%
- Service fee: 8.49 TL per order
- Return rate: 12% average (category-based)
- VAT: 20%
- Payout delay: 28 days

**Webhook Support:**
- Receives order status changes and return notifications
- Optional HMAC-SHA256 validation (if `TRENDYOL_WEBHOOK_SECRET` is set)
- Raw payloads stored in `trendyol_webhook_events` table
- Creates notifications for new orders and returns

**Key Files:**
- `lib/trendyol-api.ts` — Core API client (840+ lines)
- `app/api/marketplace/trendyol/` — 12 API route files (sync, test, webhook, normalize, finance, claims, etc.)

---

### Hepsiburada

**Status:** Fully integrated with live API connection.

**API Connection:**
- Three separate base URLs for different services:
  - OMS (orders/claims): `https://oms-external.hepsiburada.com`
  - Finance: `https://mpfinance-external.hepsiburada.com`
  - Listing (products): `https://listing-external.hepsiburada.com`
- Authentication: HTTP Basic Auth with base64-encoded `username:password`
- Required credentials: `apiKey` (username), `apiSecret` (password), `merchantId` (GUID)
- Mock mode available: when apiKey equals "HB_TEST", returns mock data

**Data Fetched:**
- Products: merchantSku, hepsiburadaSku, product name, price, stock
- Orders: order number, order date, customer name, SKU, unit price, quantity, total price, status
- Finance: Invoice-level records with total, tax, net amount, description, income/invoice flags
- Claims: claim ID, order number, type, status, reason, quantity, date, unit price

**Rate Limits:**
- 10,000 requests per 10 seconds
- On 429: reads `X-RateLimit-Reset` header for wait time, up to 3 retries
- Request timeout: 10 seconds

**Pagination:** Products use offset pagination (100 per page, max 5000 products). Orders use 30-day windows plus offset pagination (max offset 5000).

**Status Mapping:** Created → beklemede, Shipped → kargoda, Delivered → tamamlandı, Cancelled → iptal

**Service Fee Defaults:**
- Commission: 20% default
- Service fee: 9.50 TL per order
- Return rate: 12%
- VAT: 20%
- Payout delay: 30 days

**Key Files:**
- `lib/hepsiburada-api.ts` — Core API client (685 lines)
- `app/api/marketplace/hepsiburada/` — 8 API route files

---

### n11

**Status:** Data-only configuration, no live API integration yet.

- Commission: 16% default
- Extra fees: 1.87% (1.20% marketing + 0.67% marketplace) applied on VAT-inclusive price
- Return rate: 10%
- VAT: 20%
- Payout delay: 21 days
- 11 commission categories defined (8%–16%)

---

### Amazon TR

**Status:** Data-only configuration, no live API integration yet.

- Commission: 17% default
- Return rate: 13% (base 10% + 3% mandatory bonus due to Amazon's unconditional return policy)
- VAT: 20%
- Payout delay: 14 days
- 12 commission categories defined (7%–15%)
- Special rule: +3% is added to the return rate for ALL categories on Amazon TR

---

### Marketplace API Key Storage and Security

**Database Tables:**
1. `marketplace_connections` — Connection metadata (user_id, marketplace, status, store_name, seller_id, last_sync_at, webhook_active). RLS: users can only see their own connections. Unique constraint on (user_id, marketplace).
2. `marketplace_secrets` — Encrypted credentials. RLS completely blocked for all clients; only accessible via service_role. Cascade-deletes with connections.
3. `marketplace_sync_logs` — Audit trail of sync operations. RLS: users can read their own logs only.

**Encryption:**
- Algorithm: AES-256-GCM
- Key: 32 bytes, stored as `MARKETPLACE_SECRET_KEY` environment variable (base64-encoded)
- Per record: random 12-byte IV (96-bit), ciphertext, 16-byte auth tag (128-bit), key version number
- Stored as JSON blob: `{ iv, ciphertext, tag, version }`
- Key rotation endpoint: `/api/marketplace/rotate-keys` (admin-only). Decrypts all secrets with current key and re-encrypts, incrementing version.

**Connection Status Flow:** disconnected → pending_test → connected / error

---

### Product Matching and Normalization

When products are synced from a marketplace, the system tries to match them to existing analyses in the database.

**Matching priority:**
1. Barcode match → high confidence
2. Merchant SKU match → high confidence
3. Product name match → medium confidence
4. No match → creates a new analysis with `manual_required` confidence

**Order Metrics:**
- Aggregated by (product_id, month) in `product_sales_metrics` table
- Tracks: sold_qty, returned_qty, gross_revenue, net_revenue
- Suggests `auto_sales_qty` on analyses (does not override manual values)

**Automated Sync (Cron):**
- Endpoint: `GET /api/marketplace/cron` (secured via `CRON_SECRET` header)
- Processes all active Trendyol connections (status='connected')
- Steps: fetch products → fetch orders (last 3 days) → normalize → update last_sync_at → log

---

## 4. COMMISSION SYSTEM

### Storage

Commission rates are stored in the `commission_rates` table in Supabase:
- Fields: id (UUID), user_id, marketplace, category, rate (0–100, numeric with 2 decimals), updated_at
- Unique constraint: (user_id, marketplace, category)

### Default Commission Rates by Marketplace and Category

**Trendyol (15 categories):**
- Elektronik: 8%
- Bilgisayar & Tablet: 8%
- Telefon & Aksesuar: 10%
- Beyaz Eşya: 10%
- Kozmetik & Kişisel Bakım: 14%
- Ev & Yaşam: 14%
- Süpermarket & Gıda: 5%
- Spor & Outdoor: 18%
- Giyim & Moda: 20%
- Ayakkabı & Çanta: 20%
- Anne & Bebek: 12%
- Oyuncak & Hobi: 14%
- Kitap & Kırtasiye: 10%
- Otomotiv & Motosiklet: 12%
- Diğer: 14%

**Hepsiburada (13 categories):**
- Elektronik: 9%, Bilgisayar: 9%, Telefon: 10%, Beyaz Eşya: 10%, Kozmetik: 15%, Ev & Yaşam: 13%, Süpermarket: 8%, Giyim: 18%, Ayakkabı: 18%, Anne & Bebek: 13%, Spor: 15%, Kitap: 10%, Diğer: 13%

**n11 (11 categories):** 8%–16% base + 1.87% extra on all categories

**Amazon TR (12 categories):** 7%–15%

### Category Return Rates

Each category has a default expected return rate (from ETBİS 2024 data):
- Giyim & Moda: 28%
- Ayakkabı: 30%
- Kozmetik: 10%
- Elektronik: 10%
- Ev & Yaşam: 10%
- Mobilya: 7%
- Anne & Bebek: 7%
- Oyuncak: 10%
- Kitap & Kırtasiye: 3%
- Süpermarket & Gıda: 2%
- Otomotiv: 7%
- Diğer: 10%

Amazon TR adds +3% to all category return rates.

### User Override System

Users can override default commission rates with their own values:
1. User imports a CSV or Google Sheets file with columns: Pazaryeri, Kategori, Komisyon Oranı (%)
2. The system parses the CSV (supports both comma and semicolon separators)
3. Validates each rate is between 0 and 100
4. Upserts to the `commission_rates` table
5. When loading the analysis form, the system calls `getUserCommissionRates(userId)` and checks custom rates first, falling back to defaults

### Google Sheets Import

1. User provides a public Google Sheets URL
2. The API converts it to a CSV export URL
3. Fetches CSV content
4. Parses and validates
5. Upserts to database

---

## 5. PAYMENT SYSTEM (PayTR)

### Full Flow

1. User clicks "Pro Al" (Buy Pro) or selects a plan on the pricing page
2. Frontend sends `POST /api/paytr/create-payment` with the selected plan ID
3. Server generates a 96-character secure token (48 random bytes → hex)
4. Server creates a payment record in the `payments` table with status `created`, token, and token_expires_at (15 minutes from now)
5. Server generates an HMAC-SHA256 hash for the PayTR Link API and sends a POST request to PayTR
6. PayTR returns a payment link URL
7. Server responds with `{ paymentId, paymentUrl, token }`
8. Frontend opens the PayTR link in a new browser tab
9. Frontend navigates to `/payment/success?paymentId=X&token=Y`
10. User completes payment on PayTR's hosted page
11. PayTR sends a POST callback to `https://www.xn--krnet-3qa.com/api/paytr/callback`
12. Callback route verifies the hash: `HMAC-SHA256(callback_id + merchant_oid + merchantSalt + status + total_amount, merchantKey)` → base64
13. On success: updates `payments.status` to `paid`, sets `paid_at` timestamp, stores `provider_order_id`
14. Updates `profiles` table: sets plan, is_pro, plan_type, pro_started_at, pro_expires_at, pro_renewal
15. Meanwhile, the success page polls `GET /api/verify-payment?token=X` every 5 seconds (up to 120 polls = 10 minutes)
16. Verify endpoint checks: token belongs to user, token not expired, payment.status === 'paid'
17. When verified, user sees "Pro Aktif!" confirmation

### Pro Activation Database Updates

On successful callback:
- `payments.status` → `'paid'`
- `payments.paid_at` → current timestamp
- `payments.provider_order_id` → merchant_oid from callback
- `payments.raw_payload` → full callback payload (JSONB)
- `profiles.plan` → `'starter'` or `'pro'` (based on plan)
- `profiles.is_pro` → `true` (only for pro plans, not starter)
- `profiles.plan_type` → `'pro_monthly'`, `'pro_yearly'`, `'starter_monthly'`, or `'starter_yearly'`
- `profiles.pro_started_at` → current timestamp
- `profiles.pro_expires_at` → current time + 30 days (monthly) or 365 days (yearly)
- `profiles.pro_renewal` → `false`

### Pricing

- Starter Monthly: 399 TRY
- Starter Annual: 3,990 TRY
- Pro Monthly: 799 TRY
- Pro Annual: 7,990 TRY

### Test Mode

- `PAYTR_TEST_MODE=1`: Automatically activates pro plan without actually contacting PayTR
- `PAYTR_TEST_PRICE`: Overrides the payment amount (in TRY, not kuruş)
- `PAYTR_SKIP_HASH=1`: Skips hash verification on callback (debug only)

### Critical Domain Requirement

PayTR callbacks MUST use `www.xn--krnet-3qa.com`. The bare domain (`xn--krnet-3qa.com`) redirects to www via Vercel, but PayTR does not follow redirects, so callbacks would never arrive without the `www` prefix.

### Payment Database Schema

Table `payments`:
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- plan (text: 'pro_monthly', 'pro_yearly', 'starter_monthly', 'starter_yearly')
- amount_try (integer, amount in TRY)
- status (text: 'created' | 'paid' | 'failed' | 'expired')
- provider (text, default 'paytr')
- provider_order_id (text, unique — PayTR's callback_id)
- provider_tx_id (text)
- token (text — 96 hex chars)
- token_expires_at (timestamptz)
- created_at, paid_at (timestamptz)
- raw_payload (JSONB — full callback data)

---

## 6. EMAIL SYSTEM (Brevo SMTP)

### Provider Configuration

- Provider: Brevo (formerly Sendinblue)
- SMTP Host: `smtp-relay.brevo.com`
- Port: 587 (TLS)
- Credentials: `BREVO_SMTP_USER` and `BREVO_SMTP_KEY` environment variables
- Transport: Nodemailer

### Email Templates (in `lib/email/templates/`)

| # | Template | Trigger | Preference Check |
|---|----------|---------|-----------------|
| 1 | Welcome | User registration | None (always sent) |
| 2 | Email Verification | Email confirmation | None (always sent) |
| 3 | Password Reset | Password reset request | None (always sent) |
| 4 | Pro Activated | Successful PayTR callback | None (always sent) |
| 5 | Pro Expiry Warning | Cron: 7 days or 1 day before expiry | `email_pro_expiry` |
| 6 | Pro Expired | Cron: plan has expired | None (always sent) |
| 7 | Weekly Report | External trigger | `email_weekly_report` |
| 8 | Risk Alert | Analysis with high risk score | `email_risk_alert` (6h cooldown) |
| 9 | Margin Alert | Analysis below target margin | `email_margin_alert` |

### How Emails Are Triggered

- **Welcome:** Sent during user registration flow
- **Pro Activated:** Sent from the PayTR callback route after payment.status is set to 'paid'
- **Expiry Warnings:** Sent by the cron endpoint `GET /api/cron/check-expiry` (secured with `CRON_SECRET`). Queries for users whose `pro_expires_at` is exactly 7 days or 1 day away.
- **Pro Expired:** Same cron endpoint. When `pro_expires_at < now`, sets `is_pro = false` and `plan = 'free'`, then sends the expired email.
- **Risk Alert:** Sent via `POST /api/notifications/check-risk` (fire-and-forget call from the analysis save flow). Conditions: risk_score ≥ 70 OR risk_level is High/Critical/Tehlikeli. Requires 6-hour cooldown since last alert.
- **Weekly Report:** Contains analysisCount, topProduct (name + margin %), riskProduct name. Triggered externally.

### Email Preferences (columns in `profiles` table)

- `email_notifications_enabled` — Master toggle (default: true)
- `email_weekly_report` — Weekly summary (default: true)
- `email_risk_alert` — Loss detection alert (default: true)
- `email_margin_alert` — Margin warning (default: true)
- `email_pro_expiry` — Expiration warning (default: true)

### Email Logging

All email attempts are logged to the `email_logs` table with: to_email, template name, subject, status (sent/failed), provider_message_id, error message. Users can view their own logs via RLS.

---

## 7. USER PLAN SYSTEM

### Plans Overview

There are three plan tiers: Free, Starter, and Pro. The single source of truth for all limits is `config/plans.ts`.

### Free Plan — Exact Limits

- Maximum 3 analyses (products)
- Maximum 2 marketplaces
- No CSV/JSON export or import
- No Pro Accounting mode (granular VAT)
- No sensitivity analysis
- No breakeven calculation
- No cashflow analysis
- No marketplace comparison
- No API integration (marketplace sync)
- No PDF reports
- No weekly email reports
- No priority support
- No competitor tracking

### Starter Plan — Exact Limits

- Maximum 25 analyses (products)
- Maximum 4 marketplaces
- CSV export and import: yes
- JSON export: yes
- Pro Accounting mode: yes
- Sensitivity analysis: yes
- Breakeven calculation: yes
- Cashflow analysis: no
- Marketplace comparison: no
- API integration: no
- PDF reports: 5 per month
- Weekly email report: no
- Priority support: no
- Competitor tracking: no

### Pro Plan — Exact Features

- Unlimited analyses
- Unlimited marketplaces
- All export/import features
- Pro Accounting mode (granular VAT)
- All analysis features (sensitivity, breakeven, cashflow, comparison)
- Full API integration (Trendyol, Hepsiburada sync)
- Unlimited PDF reports
- Weekly email reports
- Priority support
- Competitor tracking

### How Limits Are Enforced

**Primary check function:** `checkAnalysisLimit(userId)` in `lib/plan.ts`
1. Fetches user's profile.plan from database
2. If plan is pro, pro_monthly, pro_yearly, or admin → returns true (no limits)
3. If plan is free or starter → counts existing analyses for the user and compares against `PLAN_LIMITS[plan].maxProducts`

**Pro user check function:** `isProUser(user)` in `utils/access.ts`
1. Checks if plan is in PRO_PLANS array ('pro', 'pro_monthly', 'pro_yearly')
2. If pro_expires_at is NULL → returns true (legacy pro with no expiry)
3. If pro_expires_at > now → returns true
4. If pro_until (legacy field) > now → returns true
5. Otherwise → returns false

**Starter user check:** `isStarterUser(user)` in `utils/access.ts` — simply checks `user.plan === 'starter'`

### Plan Expiry Handling

1. **Daily cron** (`/api/cron/check-expiry`): Finds users where `pro_expires_at < now`, sets `is_pro = false` and `plan = 'free'`, sends expiry email
2. **7-day warning**: Same cron finds users where pro_expires_at is 7 days away, sends warning email
3. **1-day warning**: Same cron finds users where pro_expires_at is 1 day away, sends warning email
4. **Client-side**: `isProUser()` checks expiry on every pro-feature access

### Relevant Database Columns (profiles table)

- `plan`: 'free' | 'starter' | 'pro' | 'pro_monthly' | 'pro_yearly' | 'admin'
- `is_pro`: boolean flag
- `pro_started_at`: when pro was activated
- `pro_expires_at`: when pro expires (NULL = no expiry for legacy plans)
- `pro_until`: legacy expiry field (still checked for backwards compatibility)
- `pro_renewal`: auto-renewal flag (default: true)
- `plan_type`: stores original plan ID (pro_monthly, pro_yearly, starter_monthly, starter_yearly)

---

## 8. SECURITY MECHANISMS

### Rate Limiting

- Provider: Upstash Redis (sliding window algorithm)
- Library: `@upstash/ratelimit`
- Configuration in `lib/rate-limit.ts`:
  - Auth endpoints: 5 requests per minute (key: `karnet:auth`)
  - API endpoints: 60 requests per minute (key: `karnet:api`)
  - Email endpoints: 3 requests per minute (key: `karnet:email`)
- Fail-open policy: If Redis is unavailable, requests are allowed (does not block users)
- Returns HTTP 429 when limit is exceeded

### Encryption

- Marketplace API keys are encrypted with AES-256-GCM before storage
- Encryption key: 32 bytes, from `MARKETPLACE_SECRET_KEY` env var (base64)
- Each record gets a random 96-bit IV
- Encrypted blob format: `{ iv, ciphertext, tag, version }`
- Auth tag: 128-bit for integrity verification
- Key rotation: Admin endpoint re-encrypts all secrets with current key, increments version
- Old key kept as `MARKETPLACE_SECRET_KEY_OLD` during rotation transition
- Credentials are never logged; error messages are sanitized

### Protected Routes (Middleware)

File: `middleware.ts`
- PayTR callback routes (`/api/paytr/*`) bypass auth middleware entirely (PayTR needs unauthenticated access)
- All other routes go through Supabase session update via `updateSession(request)`
- Matcher excludes: `_next/static`, `_next/image`, `favicon.ico`, static assets

### Admin Authentication

- Checked via `profile.plan === 'admin'` in `lib/admin-auth.ts`
- Required for: `/admin` routes, manual payment activation, key rotation
- No separate admin credentials; uses standard Supabase auth with admin plan

### Security Headers (in next.config.js)

- `Content-Security-Policy`: Allows PayTR frames, Brevo SMTP, Upstash Redis, Supabase connections. Blocks clickjacking with `frame-ancestors 'none'`.
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-DNS-Prefetch-Control: on`

### Input Validation

- All API routes use Zod schemas for input validation
- User input never goes directly to database queries
- Strings are trimmed and length-checked
- HTML content (like blog posts) is sanitized with DOMPurify before rendering

### Payment Token Security

- 96 hex characters (48 random bytes via crypto.randomBytes)
- Expires after 15 minutes
- Must match payment.user_id to the authenticated user
- Only reports success after PayTR callback has already marked payment as paid
- Token is not reusable

---

## 9. ANALYSIS FLOW

### Step-by-Step: User Creates an Analysis

**Step 1 — User opens the analysis form**
Component: `components/analysis/analysis-form.tsx`. Default values are loaded from a `defaultInput` constant. The system also fetches the user's custom commission rates from the database.

**Step 2 — User fills in product details**
- Basic info: product name, monthly sales volume
- Costs: product cost, sale price, shipping cost, packaging cost, ad cost per sale, other costs
- Marketplace: select from dropdown (Trendyol, Hepsiburada, n11, Amazon TR, Custom). Selecting a marketplace auto-updates: default commission rate, return rate, VAT rate, payout delay days.
- Category: select from marketplace-specific categories. Auto-updates commission rate and expected return rate.
- VAT: defaults to 20%

**Step 3 — Form validation**
Hard errors (block submission): product name required, sale price > 0.
Soft warnings (user must confirm to proceed): sale price ≤ 0, product cost < 0, monthly volume ≤ 0, commission > 35%, return rate > 35%, VAT > 30% (PRO mode only).

**Step 4 — Calculation**
- Standard users: `calculateProfit(input)` from `utils/calculations.ts`
- Pro users with pro_mode enabled: `calculateProAccounting(input)` from `utils/pro-accounting.ts`

**Step 5 — Risk assessment**
`calculateRisk(input, result)` from `utils/risk-engine.ts` → returns `{ score, level, factors[] }`

**Step 6 — Save to database**
- API: `POST /api/analyses`
- Service layer validates plan limits (free: max 3, starter: max 25, pro: unlimited)
- Validates sale_price is finite and > 0
- Combines result with risk factors: `{ ...result, _risk_factors: risk.factors }`
- DAL upserts to the `analyses` table

**Step 7 — Risk notification (fire-and-forget)**
After saving, the frontend sends `POST /api/notifications/check-risk` with the analysis ID. If conditions are met (risk_score ≥ 70, email enabled, 6h cooldown passed), sends a risk alert email.

**Step 8 — Redirect**
- New analysis → redirects to `/analysis/{id}` (detail page)
- Updated analysis → redirects to `/dashboard`

### Analysis Detail Page

When user views `/analysis/[id]`:
1. Fetches analysis from API
2. Displays risk gauge (visual 0–100 score)
3. Shows key metrics: unit profit, monthly profit, margin %, monthly revenue
4. Shows cost breakdown card
5. Advanced sections (some Pro-only): sensitivity analysis (10 scenarios), breakeven price, required prices for 15% and 30% margin targets, ad spending ceiling, cashflow impact, scenario simulator (interactive sliders), campaign simulator, VAT position (PRO mode only)

### Database Schema for Analyses

Table: `analyses`
- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- marketplace (text)
- product_name (text)
- inputs (JSONB — entire ProductInput object)
- outputs (JSONB — entire CalculationResult + _risk_factors array)
- risk_score (integer, 0–100)
- risk_level (text: 'safe' | 'moderate' | 'risky' | 'dangerous')
- created_at (timestamptz)
- competitor_price (decimal, optional)
- competitor_name (text, optional)
- target_position (text: 'cheaper' | 'same' | 'premium', optional)
- marketplace_source (text, optional — set when auto-synced from marketplace)
- auto_synced (boolean, optional)

---

## 10. AUTHENTICATION FLOW

### User Registration (Step by Step)

1. User navigates to `/auth` page and fills in email, password, full name, and accepts terms of service.
2. Client-side validation: password minimum 8 characters, passwords must match, all fields required.
3. The `register()` function in `lib/auth.ts` is called:
   - Validates password is at least 6 characters (server-side minimum).
   - Calls `supabase.auth.signUp({ email, password })`.
   - If user is created successfully, calls `fetchProfile(user.id, user.email)` to ensure a row exists in the `profiles` table with defaults: `plan: 'free'`, `email_notifications_enabled: true`.
   - Saves the full name to the profile via `profiles.update({ full_name })`.
4. A welcome email is sent via `fetch('/api/email/welcome')` (fire-and-forget, does not block registration).
5. User is redirected to `/dashboard`.

Note: Email verification is currently **disabled**. The code has a TODO comment indicating it should be re-enabled when Supabase's "Confirm email" setting is turned on.

### Email Verification Flow

The infrastructure exists but is currently inactive:
1. Supabase sends a verification email with a magic link containing `token_hash` and `type` parameters.
2. User clicks the link, which points to `/auth/callback?token_hash=X&type=email`.
3. The callback route calls `supabase.auth.verifyOtp({ token_hash, type })`.
4. On success, redirects to `/dashboard`.
5. A verify-email waiting page exists at `/auth/verify-email` but is not currently used in the registration flow.

### Login Flow

1. User enters email and password on `/auth` page.
2. The `login(email, password)` function calls `supabase.auth.signInWithPassword({ email, password })`.
3. If an error is returned, Supabase error messages are translated to Turkish:
   - Invalid credentials → "E-posta veya şifre hatalı."
   - Email not confirmed → "E-postanızı doğrulamanız gerekiyor. Gelen kutunuzu kontrol edin."
   - Rate limited → "Çok fazla deneme yaptınız. Lütfen bekleyin."
4. On success, calls `fetchProfile(user.id, user.email)` to load the user's profile data.
5. Redirects to the `next` URL parameter or `/dashboard`.

### Google OAuth Flow

1. User clicks the "Google ile Giriş Yap" button on the auth page.
2. Calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`.
3. `redirectTo` is set to `${window.location.origin}/auth/callback?next={returnUrl}`.
4. User is redirected to Google's OAuth consent screen (managed by Supabase).
5. After consent, Google redirects back to Supabase, which redirects to `/auth/callback` with a `code` parameter.
6. The callback route calls `supabase.auth.exchangeCodeForSession(code)`.
7. On success, redirects to the dashboard or the return URL.
8. Security: The callback route validates the `next` parameter to prevent open redirects — it must start with `/`, must not start with `//`, and must not contain `://`.

### Session Management

Supabase stores session tokens in httpOnly secure cookies named `sb-{projectid}-auth-token`.

**Middleware flow** (runs on every request except `/api/paytr/*`):
1. The `updateSession()` function in `lib/supabase-middleware.ts` creates a Supabase SSR client that reads and writes cookies from the request/response.
2. Calls `supabase.auth.getUser()` which refreshes the session from cookies automatically.
3. If no authenticated user is found AND the requested path is not in the public routes list AND is not under `/auth/*`, `/_next/*`, or `/api/*`, the user is redirected to `/auth?next={pathname}`.

**Public routes** (accessible without authentication):
`/`, `/auth`, `/pricing`, `/demo`, `/blog`, `/hakkimizda`, `/iletisim`, `/gizlilik-politikasi`, `/mesafeli-satis-sozlesmesi`, `/iade-politikasi`, `/kullanim-sartlari`, `/support`, `/hata`

**Client-side session sync:**
The `AuthProvider` React context (`contexts/auth-context.tsx`) subscribes to `supabase.auth.onAuthStateChange()` to keep the client-side user state in sync with server-side session changes. It provides `user`, `loading`, `login`, `register`, `logout`, `refreshUser`, and `updateProfile` to all child components.

### Password Reset Flow

**Step 1 — Forgot Password** (`/auth/forgot-password`):
1. User enters their email address.
2. Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.
3. `redirectTo` is set to `${NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`.
4. Supabase sends a password reset email with a magic link.
5. UI shows a success message confirming the email was sent.

**Step 2 — Reset Password** (`/auth/reset-password`):
1. User clicks the link in the email, which goes through `/auth/callback` and then redirects to `/auth/reset-password`.
2. User enters a new password (minimum 8 characters) and confirmation.
3. A password strength indicator shows: Weak (< 8 chars), Medium (8–11 chars), Strong (12+ chars with uppercase, lowercase, and number).
4. Calls `supabase.auth.updateUser({ password })`.
5. Handles expired or invalid link errors.
6. On success, shows confirmation and redirects to `/auth` after 3 seconds.

### What auth/callback/route.ts Does

This is the central auth callback handler. It handles two distinct flows:

1. **Email verification / magic link flow**: When `token_hash` and `type` query parameters are present, it calls `supabase.auth.verifyOtp({ token_hash, type })` to verify the token and establish a session.

2. **OAuth flow**: When a `code` query parameter is present (from Google OAuth), it calls `supabase.auth.exchangeCodeForSession(code)` to exchange the authorization code for a session.

Both flows redirect to `/dashboard` on success or to an error page on failure. The `next` query parameter can override the redirect destination, with open-redirect protection.

### Supabase Clients in the Codebase

- **Browser Client** (`lib/supabaseClient.ts`): Uses the anon key, respects RLS policies. Used in client components and auth flows.
- **Server Client** (`lib/supabase-server-client.ts` → `createClient()`): Used in API routes, manages cookies automatically.
- **Admin Client** (`lib/supabase-server-client.ts` → `createAdminClient()`): Uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS. Used exclusively in DAL functions for operations that need full database access.

---

## 11. NOTIFICATION SYSTEM

### Database Schema

Table: `notifications`
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `analysis_id` (UUID, optional — links to the related analysis)
- `product_id` (UUID, optional — links to a product)
- `href` (text, optional — navigation link for the notification)
- `type` (text: 'danger' | 'warning' | 'info')
- `category` (text, e.g., "risk_alert", "profit_margin")
- `title` (text, notification title)
- `message` (text, notification body)
- `is_read` (boolean, default false)
- `created_at` (timestamptz)
- `dedupe_key` (text, used with user_id for deduplication)

Unique constraint: `(user_id, dedupe_key)` — prevents duplicate notifications for the same event.

### How In-App Notifications Are Created

Notifications are created via the `POST /api/notifications` endpoint or directly through the DAL function `upsertNotifications()` in `dal/notifications.ts`.

The upsert mechanism uses the `(user_id, dedupe_key)` unique constraint: if a notification with the same user and dedupe_key already exists, it is replaced. If dedupe_key is null, each insertion creates a new unique notification.

The primary creation path is:
1. A backend process (e.g., risk analysis, order sync, webhook) determines a notification should be created.
2. It constructs a notification object with user_id, type, category, title, message, and optionally analysis_id, href, and dedupe_key.
3. The object is sent to the notifications API or DAL function.
4. The DAL function uses `upsert()` with conflict handling on the dedupe key.

### Read/Unread Logic

- `getNotificationsByUserId(userId, limit=50)` — fetches the user's unread notifications, limited to the most recent 50, ordered by `created_at DESC`.
- `markNotificationAsRead(id)` — marks a single notification as read by setting `is_read = true`.
- `markAllNotificationsAsRead(userId)` — marks all of a user's unread notifications as read in one operation.

All functions use the admin client to bypass RLS.

### Which Events Create Notifications

Based on the codebase, notifications are created for:
1. **Risk alerts** — when a product analysis has a high risk score (risk_score ≥ 70 or dangerous risk level).
2. **Profit margin alerts** — when an analysis falls below the user's target margin.
3. **Marketplace events** — new orders or returns received via Trendyol webhook create notifications.
4. **Pro plan events** — expiry warnings and activation confirmations.

### How Frontend Polls for Notifications

The frontend calls `GET /api/notifications` which:
1. Authenticates the user via session cookie.
2. Calls `notificationsDal.getNotificationsByUserId(user.id)`.
3. Returns the list of notifications ordered by `created_at DESC`.

Mark-as-read endpoints:
- `PATCH /api/notifications/[id]/read` — marks a single notification as read.
- `PATCH /api/notifications/read-all` — marks all unread notifications as read.

The frontend is expected to call these endpoints on demand (e.g., when the notification bell is clicked or the notification panel is opened). No fixed polling interval was found configured in the codebase.

---

## 12. SUPPORT TICKET SYSTEM

### How Users Create Tickets

1. User navigates to `/support` page which displays a collapsible ticket creation form.
2. User fills in: subject (1–200 characters), category (dropdown), priority (dropdown), and message (20–5,000 characters).
3. Input is validated against a Zod schema (`CreateTicketSchema` in `lib/validations/support.ts`).
4. On submit, the form calls `POST /api/support/tickets`.
5. The API route applies rate limiting (`apiRateLimit.limit(ip)`), checks authentication, validates input, and calls `supportService.createTicket()`.
6. The service layer calls `supportDal.createTicket()` which inserts into the `tickets` table with status `'acik'` (open).
7. On success, the form collapses, a toast is shown, and the ticket list is refreshed.
8. The support page also displays direct contact information (email and WhatsApp).

### Ticket Statuses and Flow

**Statuses:**
- `acik` (Open) — newly created ticket, default status.
- `inceleniyor` (Under Review) — admin has started reviewing.
- `cevaplandi` (Answered) — admin has replied.
- `kapali` (Closed) — ticket is closed by admin.

**Priorities:**
- `dusuk` (Low)
- `normal` (Normal) — default
- `yuksek` (High)
- `acil` (Urgent)

**Categories:**
- `teknik` (Technical)
- `odeme` (Payment)
- `hesap` (Account)
- `oneri` (Suggestion)
- `diger` (Other)

Tickets are sorted by priority first (urgent → low), then by creation date (newest first).

### How Admin Replies

1. Admin navigates to `/admin/support` which displays all tickets with filtering by status, priority, category, and search by email or subject.
2. Admin clicks "Cevapla" (Reply) on a ticket, which opens a dialog showing the original message.
3. Admin enters a reply in the text area and optionally changes the ticket status.
4. Clicking "Cevapla & Kaydet" (Reply & Save) sends `PATCH /api/admin/support/tickets/{id}` with `{ admin_reply, status }`.
5. The backend updates `admin_reply`, sets `admin_replied_at` to the current timestamp, and updates the status.
6. Admin can also close a ticket directly with the "Talebi Kapat" (Close Ticket) button, or delete it entirely.

The admin dashboard also shows statistics: open count, under-review count, answered-today count, and total count.

### Email Notifications for Tickets

Ticket-specific email templates were not found in the codebase. This means:
- No automatic email is sent to the user when their ticket receives an admin reply.
- No confirmation email is sent when a ticket is created.
- This appears to be a feature that has not yet been implemented.

### Database Schema

Table: `tickets`
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `user_email` (text, denormalized from auth.users for easier admin querying)
- `subject` (text, max 200 characters)
- `category` (text: 'teknik' | 'odeme' | 'hesap' | 'oneri' | 'diger')
- `priority` (text: 'dusuk' | 'normal' | 'yuksek' | 'acil')
- `status` (text: 'acik' | 'inceleniyor' | 'cevaplandi' | 'kapali')
- `message` (text, min 20, max 5000 characters)
- `admin_reply` (text or null)
- `admin_replied_at` (timestamptz or null)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Validation schemas are defined in `lib/validations/support.ts` using Zod.

---

## 13. ADMIN PANEL

### What Admin Can Do

The admin panel is located at `/admin` and provides the following capabilities:

**1. Dashboard** (`/admin`):
- View KPI cards: total users, pro users, free users, total analyses, total revenue (sum of paid payments), total support tickets, open tickets.
- See a list of the 5 most recently registered users with their email, plan, and registration date.

**2. User Management** (`/admin/users`):
- Search users by email.
- Filter users by plan (free, starter, pro, admin).
- Paginate through users (20 per page).
- Change any user's plan. When changing to pro without an explicit expiry date, the system automatically sets pro_until to 365 days from now, and fills in pro_started_at, pro_expires_at. When changing to free, all pro-related dates are cleared.

**3. Payment Management** (`/admin/payments`):
- View all payments with user email, plan type, amount, status, and date.
- Filter by payment status (paid, created, failed).
- Paginate through payments (20 per page).
- Manually activate pending or failed payments (see flow below).

**4. Support Ticket Management** (`/admin/support`):
- View all tickets with filters by status, priority, and category.
- Search tickets by email or subject (debounced 500ms).
- Reply to tickets and change their status.
- Close or delete tickets.
- View statistics (open, reviewing, answered today, total).

**5. Blog Comment Moderation** (`/admin/comments`):
- Two tabs: Pending (awaiting approval) and Approved.
- Approve pending comments (sets `is_approved = true`).
- Reject comments (deletes them from the database).

### Admin Authentication Check

Admin authorization is handled by `verifyAdmin()` in `lib/admin-auth.ts`:
1. Creates a Supabase server client from cookies and calls `getUser()` to verify the session.
2. If no session, returns 401 Unauthorized.
3. Uses the admin client (service role, bypasses RLS) to fetch the user's profile and check `profile.plan === 'admin'`.
4. If plan is not 'admin', returns 403 Forbidden.
5. On success, returns `{ authorized: true, userId, adminClient }`.

Additionally, the admin layout (`app/admin/layout.tsx`) performs a server-side redirect: if the user's plan is not 'admin', they are redirected to `/dashboard`.

### Admin-Only API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/users` | GET | List users with search/filter/pagination |
| `/api/admin/users` | PATCH | Change a user's plan |
| `/api/admin/payments` | GET | List all payments |
| `/api/admin/activate-payment` | POST | Manually activate a payment |
| `/api/admin/support/tickets` | GET | List all support tickets with filters |
| `/api/admin/support/tickets/[id]` | PATCH | Reply to or update a ticket |
| `/api/admin/support/tickets/[id]` | DELETE | Delete a ticket |
| `/api/admin/blog-comments` | GET | List blog comments by approval status |
| `/api/admin/blog-comments` | PATCH | Approve or reject a comment |

### Manual Payment Activation Flow

1. Admin navigates to `/admin/payments` and finds a payment with status "created" or "failed".
2. Admin clicks the "Aktive Et" (Activate) button on the payment row.
3. Frontend sends `POST /api/admin/activate-payment` with `{ paymentId }`.
4. Backend verifies admin authorization via `verifyAdmin()`.
5. Fetches the payment record by ID.
6. Determines plan duration from plan type: `pro_monthly` or `starter_monthly` = 30 days, `pro_yearly` or `starter_yearly` = 365 days.
7. Calculates `pro_until` date.
8. Updates the payment record: `status = 'paid'`, `paid_at = now()`.
9. Updates the user's profile: `plan = 'pro'` (or 'starter'), `is_pro = true`, `plan_type`, `pro_until`, `pro_started_at = now()`, `pro_expires_at = pro_until`, `pro_renewal = false`.
10. Returns success with user_id and pro_until date.
11. Frontend shows a success toast and refreshes the payment list.

### User Management Features

- **View users**: Lists all users with email, current plan, pro expiration date, and registration date.
- **Search**: Filter by email address.
- **Filter by plan**: Show only free, starter, pro, or admin users.
- **Change plan**: Admin can promote or demote any user's plan. The system automatically manages pro dates when the plan is changed. Setting a user to admin gives them full admin access.
- **Pagination**: 20 users per page.

---

## 14. PDF REPORT SYSTEM

### How PDFs Are Generated

PDFs are generated entirely on the server side in the API route `app/api/pdf/analysis/[id]/route.ts`. There is no client-side PDF rendering.

1. User clicks the "PDF İndir" (Download PDF) button on the analysis detail page.
2. Frontend sends a GET request to `/api/pdf/analysis/{id}` with the user's session token in the Authorization header.
3. The API route authenticates the user, fetches the analysis from the database, and verifies ownership (analysis.user_id must match the logged-in user).
4. The server recalculates all values from the stored inputs (commission, VAT, returns, breakeven, margin) to ensure accuracy.
5. A PDF document is created programmatically using the `pdf-lib` library (A4 size: 595.28 × 841.89 points).
6. The PDF is returned with `Content-Type: application/pdf` and a `Content-Disposition: attachment` header.

### Which Library Is Used

**pdf-lib** with **@pdf-lib/fontkit** for custom font embedding. This is a pure JavaScript library that creates PDFs from scratch without requiring a browser or headless Chrome.

Fonts: Ubuntu Regular and Bold are loaded from an external CDN. If they fail to load, Helvetica is used as a fallback. Turkish characters (Ğ, ş, ı, ö, ç, ü, İ) are properly handled or replaced with Latin equivalents when using the fallback font.

### What Data Is Included in the PDF

**Header Section:**
- Kârnet logo (vector chart icon drawn with pdf-lib)
- Title: "Kârnet ANALİZ RAPORU"
- Product name and marketplace name
- Report generation date

**Summary Cards (6 cards in 2 rows):**
- Row 1: Sale Price (Satış Fiyatı), Monthly Net Profit (Aylık Net Kâr), Profit Margin % (Kâr Marjı)
- Row 2: Monthly Revenue estimate (Aylık Ciro), Unit Profit (Birim Kâr), Breakeven Price (Başabaş Noktası)
- Monthly Net Profit and Margin are color-coded: green for positive/healthy, red for negative/low.

**Cost Breakdown Table:**
Lists all cost components with values greater than zero:
- Product Cost (Ürün Maliyeti)
- Commission (Komisyon) with percentage shown
- VAT (KDV)
- Shipping (Kargo)
- Packaging (Paketleme)
- Ad Cost per Unit (Reklam Birim)
- Return Loss (İade Kaybı)
- Other Costs (Diğer Giderler)
- Total Unit Cost (Toplam Birim Maliyet) — highlighted

**Donut Chart:**
Visual cost distribution showing Product, Commission, Shipping, and Other as colored segments with a legend.

**Footer:**
- Website URL (karnet.com)
- Support email (destek@karnet.com)
- Page number and Report ID (format: KNR-YYYYMMDD-XXXX)
- Disclaimer box: "Bu rapor tahmini hesaplamalara dayanır. Sonuçlar pazar yeri kesintileri ve piyasa koşullarına göre değişebilir." (This report is based on estimated calculations. Results may vary depending on marketplace deductions and market conditions.)

### Plan Limits for PDF

The plan configuration in `config/plans.ts` defines `pdfReportMonthly`:
- Free: 0 (cannot download PDFs)
- Starter: 5 per month
- Pro: Unlimited (Infinity)
- Admin: Unlimited (Infinity)

**Current enforcement status:** The client-side blocks free users from clicking the download button by showing an upgrade modal. However, the server-side API route does not currently enforce the monthly download limit — it only checks authentication and ownership. The monthly PDF count is not tracked in the database.

---

## 15. BLOG SYSTEM

### How Blog Content Is Stored

Blog posts are stored as a **static TypeScript array** in `lib/blog.ts`, not in the database. Each post is an object with:
- `slug` — URL-friendly identifier (e.g., "trendyol-komisyon-oranlari-2026")
- `title` — post title
- `description` — short summary for listing pages and SEO
- `date` — publication date in YYYY-MM-DD format
- `readTime` — estimated read time in minutes
- `content` — full post body as raw HTML string

There are currently 3 blog posts:
1. "Hepsiburada'da Gerçek Kârınızı Nasıl Hesaplarsınız?"
2. "Trendyol Komisyon Oranları 2026 — Tam Liste"
3. "Trendyol'da Gerçek Kârınızı Nasıl Hesaplarsınız?"

To add, edit, or delete blog posts, a developer must manually modify `lib/blog.ts` and redeploy. There is no blog CRUD API or admin UI for managing posts.

### How Slug Pages Work

**Blog listing page** (`/blog`):
- Imports `blogPosts` from `lib/blog.ts`.
- Renders all posts as cards showing title, description, date, and read time.
- Each card links to `/blog/[slug]`.

**Blog detail page** (`/blog/[slug]`):
- Uses Next.js `generateStaticParams()` to pre-render all known slugs at build time.
- Looks up the post by slug using `getBlogPost(slug)` from `lib/blog.ts`.
- Returns a 404 page if the slug is not found.
- Renders the post with: back button, title, description, meta info (date and read time), full HTML content via `dangerouslySetInnerHTML`, a call-to-action section linking to signup, and the comments section component.
- Generates proper SEO metadata (title, description, OpenGraph tags) per post.

### Comment System

Blog comments are stored in the database and go through a moderation workflow.

**Database table:** `blog_comments`
- `id` (UUID, primary key)
- `post_slug` (text — links to the blog post by slug)
- `author_name` (text, max 100 characters)
- `content` (text, max 2,000 characters)
- `created_at` (timestamptz)
- `is_approved` (boolean, default false)

**Comment submission flow:**
1. The `CommentsSection` component (below each blog post) shows a form with author name and comment content fields.
2. Validation: both fields required, author max 100 chars, content max 2,000 chars.
3. On submit, sends `POST /api/blog/comments` with slug, author_name, and content.
4. The API inserts the comment with `is_approved = false` (pending moderation).
5. User sees a success message: "Yorumunuz alındı, incelendikten sonra yayınlanacak." (Your comment has been received, it will be published after review.)

**Comment display:**
- `GET /api/blog/comments?slug=X` fetches only comments where `is_approved = true` for the given slug.
- Comments are ordered by `created_at` ascending (oldest first).
- Only `id`, `author_name`, `content`, and `created_at` are returned (no IP or email exposed).

**Admin moderation** (`/admin/comments`):
- Two tabs: "Bekleyen" (Pending) and "Onaylanan" (Approved).
- Each pending comment shows: author name, blog post slug, content, and date.
- Admin can approve (sets `is_approved = true`) or reject (deletes from database).
- Managed via `GET/PATCH /api/admin/blog-comments`.

**Limitations:**
- No rate limiting or spam prevention on comment submission.
- Users cannot edit or delete their own comments after submission.
- No email notification when a comment is approved or replied to.
