# DATABASE SCHEMA — Kârnet

Complete Supabase PostgreSQL database schema for the Kârnet application. This document covers every table, column, constraint, relationship, RLS policy, function, and trigger.

---

## 1. ALL TABLES

### 1.1 profiles

**Purpose:** Stores user profile data, plan information, preferences, and email notification settings. Created automatically when a user registers via a trigger on `auth.users`.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | — | PK, references auth.users(id) ON DELETE CASCADE |
| email | text | NOT NULL | — | |
| plan | text | NOT NULL | 'free' | CHECK IN ('free', 'pro') in migration, but code uses wider range |
| created_at | timestamptz | YES | now() | |
| plan_expires_at | timestamptz | YES | NULL | |
| email_alerts_enabled | boolean | YES | true | Legacy field |
| updated_at | timestamptz | YES | NULL | |
| fixed_cost_monthly | float | YES | 0 | User's monthly fixed costs |
| target_profit_monthly | float | YES | 0 | User's monthly profit target |
| pro_until | timestamptz | YES | NULL | Legacy expiry field, still checked for backwards compatibility |
| pro_expires_at | timestamptz | YES | NULL | When pro subscription expires |
| pro_renewal | boolean | YES | false | Auto-renewal flag |
| pro_started_at | timestamptz | YES | NULL | When pro was first activated |
| email_notifications_enabled | boolean | YES | true | Master email toggle |
| notification_email | text | YES | NULL | Override email for notifications |
| last_notification_sent_at | timestamptz | YES | NULL | Cooldown tracking |
| is_pro | boolean | YES | false | Quick boolean flag for pro status |
| plan_type | text | YES | NULL | Stores original plan ID (pro_monthly, pro_yearly, etc.) |
| full_name | text | YES | NULL | User's display name |
| email_weekly_report | boolean | YES | true | Weekly report preference |
| email_risk_alert | boolean | YES | true | Risk alert preference |
| email_margin_alert | boolean | YES | true | Margin alert preference |
| email_pro_expiry | boolean | YES | true | Expiry warning preference |
| target_margin | numeric | YES | NULL | User's target profit margin |
| margin_alert | boolean | YES | NULL | Margin alert enabled |
| default_marketplace | text | YES | NULL | Preferred marketplace |
| default_commission | numeric | YES | NULL | Default commission rate |
| default_vat | numeric | YES | NULL | Default VAT rate |
| monthly_profit_target | numeric | YES | NULL | Alternative profit target field |
| default_return_rate | numeric | YES | NULL | Default return rate |
| default_ads_cost | numeric | YES | NULL | Default ad cost |

**Primary Key:** id
**Foreign Keys:** id → auth.users(id) ON DELETE CASCADE
**Indexes:** Primary key index on id

---

### 1.2 analyses

**Purpose:** Stores product profitability analyses. Each row represents one product analysis with all inputs, calculated outputs, and risk assessment stored as JSONB.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| marketplace | text | NOT NULL | — | |
| product_name | text | NOT NULL | — | |
| inputs | jsonb | NOT NULL | — | Full ProductInput object |
| outputs | jsonb | NOT NULL | — | Full CalculationResult + _risk_factors |
| risk_score | integer | NOT NULL | — | 0–100 |
| risk_level | text | NOT NULL | — | CHECK IN ('safe','moderate','risky','dangerous') |
| created_at | timestamptz | YES | now() | |
| competitor_price | numeric | YES | NULL | |
| competitor_name | text | YES | NULL | |
| target_position | text | YES | NULL | 'cheaper', 'same', or 'premium' |
| merchant_sku | text | YES | NULL | For marketplace matching |
| barcode | text | YES | NULL | For marketplace matching |
| marketplace_source | text | YES | 'manual' | 'manual' or marketplace name |
| auto_synced | boolean | YES | false | True if created by marketplace sync |
| auto_sales_qty | int | YES | NULL | Suggested sales qty from order data |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Indexes:**
- analyses_user_id_idx ON (user_id)
- analyses_created_at_idx ON (created_at DESC)
- idx_analyses_merchant_sku ON (merchant_sku)
- idx_analyses_barcode ON (barcode)

---

### 1.3 notifications

**Purpose:** In-app notification system. Stores alerts for risk, margin, marketplace events, and plan status changes.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| analysis_id | uuid | YES | NULL | FK to analyses(id), optional |
| product_id | uuid | YES | NULL | Optional product reference |
| href | text | YES | NULL | Navigation link |
| type | text | NOT NULL | — | CHECK IN ('danger','warning','info') |
| category | text | NOT NULL | 'general' | e.g. 'risk_alert', 'profit_margin' |
| title | text | NOT NULL | — | |
| message | text | NOT NULL | — | |
| is_read | boolean | NOT NULL | false | |
| dedupe_key | text | YES | NULL | For upsert deduplication |
| created_at | timestamptz | NOT NULL | now() | |

**Primary Key:** id
**Foreign Keys:**
- user_id → auth.users(id) ON DELETE CASCADE
- analysis_id → analyses(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, dedupe_key)
**Indexes:**
- idx_notifications_user_created ON (user_id, created_at DESC)
- idx_notifications_user_unread ON (user_id, is_read) WHERE is_read = false

---

### 1.4 payments

**Purpose:** Tracks all payment transactions initiated via PayTR. Stores payment status, tokens, and raw webhook payloads.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| plan | text | NOT NULL | — | CHECK IN ('pro_monthly','pro_yearly') |
| amount_try | integer | NOT NULL | — | Amount in TRY |
| status | text | NOT NULL | 'created' | CHECK IN ('created','paid','failed') |
| provider | text | NOT NULL | 'shopier' | Payment provider name |
| provider_order_id | text | NOT NULL | — | UNIQUE, PayTR's callback_id |
| provider_tx_id | text | YES | NULL | |
| created_at | timestamptz | NOT NULL | now() | |
| paid_at | timestamptz | YES | NULL | |
| raw_payload | jsonb | YES | NULL | Full callback data |
| email | text | YES | NULL | Payer email |
| currency | text | YES | 'TRY' | |
| token | text | YES | NULL | 96-char hex verification token |
| token_expires_at | timestamptz | YES | NULL | Token expiry (15 min) |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Unique Constraints:** provider_order_id
**Indexes:**
- idx_payments_user_id ON (user_id)
- idx_payments_provider_order_id ON (provider_order_id)
- idx_payments_status ON (status)

---

### 1.5 tickets

**Purpose:** Support ticket system. Users create tickets, admins reply and manage status.

Note: The migration creates the table as `support_tickets`, but the DAL and most API routes reference it as `tickets`. The actual table in production is named `tickets`.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| user_email | text | YES | NULL | Denormalized for admin queries |
| subject | text | NOT NULL | — | Max 200 chars |
| category | text | NOT NULL | — | 'teknik','odeme','hesap','oneri','diger' |
| priority | text | NOT NULL | 'normal' | 'dusuk','normal','yuksek','acil' |
| status | text | NOT NULL | 'acik' | 'acik','inceleniyor','cevaplandi','kapali' |
| message | text | NOT NULL | — | Min 20, max 5000 chars |
| admin_reply | text | YES | NULL | |
| admin_replied_at | timestamptz | YES | NULL | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Auto-updated by trigger |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Triggers:** `set_updated_at` BEFORE UPDATE → sets updated_at = now()

---

### 1.6 admin_users

**Purpose:** Tracks which users have admin privileges. Used by RLS policies on support_tickets for cross-user access.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| user_id | uuid | NOT NULL | — | PK, FK to auth.users(id) |
| created_at | timestamptz | YES | now() | |

**Primary Key:** user_id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE

---

### 1.7 email_logs

**Purpose:** Audit trail for all sent emails. Tracks success/failure, provider message IDs, and error details.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | YES | NULL | FK to auth.users(id) ON DELETE SET NULL |
| to_email | text | NOT NULL | — | |
| template | text | NOT NULL | — | Template name |
| subject | text | NOT NULL | — | |
| status | text | YES | NULL | CHECK IN ('sent','failed') |
| provider | text | YES | 'resend' | Email provider used |
| provider_message_id | text | YES | NULL | |
| error | text | YES | NULL | Error message if failed |
| created_at | timestamptz | YES | now() | |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE SET NULL
**Indexes:**
- idx_email_logs_user_id ON (user_id)
- idx_email_logs_created_at ON (created_at DESC)

---

### 1.8 cash_plan

**Purpose:** Monthly cash flow planning for users. Tracks opening/closing cash, inflows, and outflows per month.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | YES | NULL | FK to auth.users(id) |
| month | text | NOT NULL | — | Format: 'YYYY-MM' |
| opening_cash | float | YES | 0 | |
| cash_in | float | YES | 0 | |
| cash_out | float | YES | 0 | |
| closing_cash | float | YES | 0 | |
| updated_at | timestamptz | YES | now() | |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, month)

---

### 1.9 commission_rates

**Purpose:** User-customized commission rates per marketplace and category. Overrides the default rates defined in code.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to profiles(id) |
| marketplace | text | NOT NULL | — | |
| category | text | NOT NULL | — | |
| rate | numeric(6,2) | NOT NULL | — | 0–100 |
| updated_at | timestamptz | NOT NULL | now() | |

**Primary Key:** id
**Foreign Keys:** user_id → profiles(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, marketplace, category)
**Indexes:**
- idx_commission_rates_user_id ON (user_id)
- idx_commission_rates_lookup ON (user_id, marketplace, category)

---

### 1.10 marketplace_connections

**Purpose:** Stores marketplace API connection metadata. One row per user per marketplace.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| marketplace | text | NOT NULL | 'trendyol' | |
| status | text | NOT NULL | 'disconnected' | CHECK IN ('disconnected','connected','connected_demo','pending_test','error') |
| store_name | text | YES | NULL | |
| seller_id | text | YES | NULL | |
| last_sync_at | timestamptz | YES | NULL | |
| webhook_active | boolean | NOT NULL | false | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Auto-updated by trigger |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, marketplace)
**Indexes:** idx_mc_user_id ON (user_id)
**Triggers:** `trg_mc_updated_at` BEFORE UPDATE → sets updated_at = now()

---

### 1.11 marketplace_secrets

**Purpose:** Stores AES-256-GCM encrypted marketplace API credentials. Completely locked from client access — only service_role can read/write.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| connection_id | uuid | NOT NULL | — | UNIQUE FK to marketplace_connections(id) |
| encrypted_blob | text | NOT NULL | — | JSON: { iv, ciphertext, tag, version } |
| key_version | int | NOT NULL | 1 | Encryption key version |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Auto-updated by trigger |

**Primary Key:** id
**Foreign Keys:** connection_id → marketplace_connections(id) ON DELETE CASCADE
**Unique Constraints:** connection_id (one secret per connection)
**Triggers:** `trg_ms_updated_at` BEFORE UPDATE → sets updated_at = now()

---

### 1.12 marketplace_sync_logs

**Purpose:** Audit trail for marketplace sync operations. Tracks which syncs ran, their status, and any error messages.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| connection_id | uuid | NOT NULL | — | FK to marketplace_connections(id) |
| sync_type | text | NOT NULL | — | CHECK IN ('products','orders','test') |
| status | text | NOT NULL | — | CHECK IN ('success','failed','running') |
| message | text | YES | NULL | |
| started_at | timestamptz | NOT NULL | now() | |
| finished_at | timestamptz | YES | NULL | |

**Primary Key:** id
**Foreign Keys:** connection_id → marketplace_connections(id) ON DELETE CASCADE
**Indexes:** idx_msl_connection_id ON (connection_id)

---

### 1.13 product_marketplace_map

**Purpose:** Maps external marketplace product IDs to internal analyses. Used for automatic product matching during sync.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| marketplace | text | NOT NULL | 'trendyol' | |
| external_product_id | text | NOT NULL | — | |
| merchant_sku | text | YES | NULL | |
| barcode | text | YES | NULL | |
| external_title | text | YES | NULL | |
| internal_product_id | uuid | YES | NULL | FK to analyses(id) ON DELETE SET NULL |
| match_confidence | text | NOT NULL | 'manual_required' | CHECK IN ('high','medium','manual_required') |
| connection_id | uuid | YES | NULL | FK to marketplace_connections(id) |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Auto-updated by trigger |

**Primary Key:** id
**Foreign Keys:**
- user_id → auth.users(id) ON DELETE CASCADE
- internal_product_id → analyses(id) ON DELETE SET NULL
- connection_id → marketplace_connections(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, marketplace, external_product_id)
**Indexes:**
- idx_pmm_user_id ON (user_id)
- idx_pmm_internal ON (internal_product_id)
- idx_pmm_user_sku ON (user_id, merchant_sku)
- idx_pmm_user_barcode ON (user_id, barcode)
- idx_pmm_connection ON (connection_id)
**Triggers:** `trg_pmm_updated_at` BEFORE UPDATE → sets updated_at = now()

---

### 1.14 product_sales_metrics

**Purpose:** Aggregated monthly sales and return metrics per product per marketplace. Built from synced order data.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| internal_product_id | uuid | NOT NULL | — | FK to analyses(id) |
| marketplace | text | NOT NULL | 'trendyol' | |
| period_month | date | NOT NULL | — | First day of month (e.g. 2026-03-01) |
| sold_qty | int | NOT NULL | 0 | |
| returned_qty | int | NOT NULL | 0 | |
| gross_revenue | numeric | NOT NULL | 0 | |
| net_revenue | numeric | NOT NULL | 0 | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Auto-updated by trigger |

**Primary Key:** id
**Foreign Keys:**
- user_id → auth.users(id) ON DELETE CASCADE
- internal_product_id → analyses(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, internal_product_id, marketplace, period_month)
**Indexes:**
- idx_psm_user ON (user_id)
- idx_psm_product ON (internal_product_id)
- idx_psm_period ON (period_month)
**Triggers:** `trg_psm_updated_at` BEFORE UPDATE → sets updated_at = now()

---

### 1.15 trendyol_products_raw

**Purpose:** Raw product data fetched from Trendyol API. Stores both parsed fields and the full API response as JSONB.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| connection_id | uuid | NOT NULL | — | FK to marketplace_connections(id) |
| external_product_id | text | NOT NULL | — | |
| merchant_sku | text | YES | NULL | |
| barcode | text | YES | NULL | |
| title | text | NOT NULL | — | |
| brand | text | YES | NULL | |
| category_path | text | YES | NULL | |
| sale_price | numeric | YES | NULL | |
| raw_json | jsonb | NOT NULL | '{}' | Full Trendyol API response |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Auto-updated by trigger |

**Primary Key:** id
**Foreign Keys:**
- user_id → auth.users(id) ON DELETE CASCADE
- connection_id → marketplace_connections(id) ON DELETE CASCADE
**Unique Constraints:** (connection_id, external_product_id)
**Indexes:**
- idx_tpr_user_id ON (user_id)
- idx_tpr_connection_id ON (connection_id)
**Triggers:** `trg_tpr_updated_at` BEFORE UPDATE → sets updated_at = now()

---

### 1.16 trendyol_orders_raw

**Purpose:** Raw order data fetched from Trendyol API. Stores both parsed fields and the full API response as JSONB.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| connection_id | uuid | NOT NULL | — | FK to marketplace_connections(id) |
| order_number | text | NOT NULL | — | |
| order_date | timestamptz | YES | NULL | |
| status | text | YES | NULL | |
| total_price | numeric | YES | NULL | |
| raw_json | jsonb | NOT NULL | '{}' | Full Trendyol API response |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Auto-updated by trigger |

**Primary Key:** id
**Foreign Keys:**
- user_id → auth.users(id) ON DELETE CASCADE
- connection_id → marketplace_connections(id) ON DELETE CASCADE
**Unique Constraints:** (connection_id, order_number)
**Indexes:**
- idx_tor_user_id ON (user_id)
- idx_tor_connection_id ON (connection_id)
**Triggers:** `trg_tor_updated_at` BEFORE UPDATE → sets updated_at = now()

---

### 1.17 hepsiburada_products_raw

**Purpose:** Raw product data fetched from Hepsiburada API.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| connection_id | uuid | NOT NULL | — | FK to marketplace_connections(id) |
| external_product_id | text | NOT NULL | — | |
| merchant_sku | text | YES | NULL | |
| barcode | text | YES | NULL | |
| title | text | NOT NULL | '' | |
| brand | text | YES | NULL | |
| category_path | text | YES | NULL | |
| sale_price | numeric | YES | NULL | |
| raw_json | jsonb | YES | NULL | Full Hepsiburada API response |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Primary Key:** id
**Foreign Keys:**
- user_id → auth.users(id) ON DELETE CASCADE
- connection_id → marketplace_connections(id) ON DELETE CASCADE
**Unique Constraints:** (connection_id, external_product_id)
**Indexes:**
- idx_hb_products_user ON (user_id)
- idx_hb_products_conn ON (connection_id)

---

### 1.18 hepsiburada_orders_raw

**Purpose:** Raw order data fetched from Hepsiburada API.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| connection_id | uuid | NOT NULL | — | FK to marketplace_connections(id) |
| order_number | text | NOT NULL | — | |
| order_date | timestamptz | YES | NULL | |
| status | text | YES | NULL | |
| total_price | numeric | YES | NULL | |
| raw_json | jsonb | YES | NULL | Full Hepsiburada API response |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Primary Key:** id
**Foreign Keys:**
- user_id → auth.users(id) ON DELETE CASCADE
- connection_id → marketplace_connections(id) ON DELETE CASCADE
**Unique Constraints:** (connection_id, order_number)
**Indexes:**
- idx_hb_orders_user ON (user_id)
- idx_hb_orders_conn ON (connection_id)

---

### 1.19 hb_products

**Purpose:** Secondary Hepsiburada product table with Turkish column names. Used by the dashboard for quick product display.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| hepsiburada_sku | text | NOT NULL | — | |
| merchant_sku | text | YES | NULL | |
| urun_adi | text | YES | NULL | Product name |
| fiyat | numeric(12,2) | YES | NULL | Price |
| stok | integer | YES | NULL | Stock count |
| aktif | boolean | YES | true | Active flag |
| guncelleme_tarihi | timestamptz | YES | now() | Last update date |
| created_at | timestamptz | YES | now() | |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, hepsiburada_sku)
**Indexes:** idx_hb_products_user_id ON (user_id)

---

### 1.20 hb_orders

**Purpose:** Secondary Hepsiburada order table with Turkish column names. Used by the dashboard for quick order display.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK to auth.users(id) |
| siparis_no | text | NOT NULL | — | Order number |
| siparis_tarihi | timestamptz | YES | NULL | Order date |
| musteri_adi | text | YES | NULL | Customer name |
| hepsiburada_sku | text | YES | NULL | |
| satici_sku | text | YES | NULL | Seller SKU |
| birim_fiyat | numeric(12,2) | YES | NULL | Unit price |
| adet | integer | YES | NULL | Quantity |
| toplam_fiyat | numeric(12,2) | YES | NULL | Total price |
| durum | text | YES | NULL | Order status |
| created_at | timestamptz | YES | now() | |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Unique Constraints:** (user_id, siparis_no)
**Indexes:**
- idx_hb_orders_user_id ON (user_id)
- idx_hb_orders_siparis_tarihi ON (siparis_tarihi DESC)

---

### 1.21 trendyol_webhook_events

**Purpose:** Stores raw webhook event payloads received from Trendyol for order status changes and returns.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | YES | NULL | FK to auth.users(id) |
| connection_id | uuid | YES | NULL | |
| event_type | text | YES | NULL | |
| seller_id | text | YES | NULL | |
| shipment_package_id | bigint | YES | NULL | |
| order_number | text | YES | NULL | |
| status | text | YES | NULL | |
| payload | jsonb | YES | NULL | Full webhook payload |
| received_at | timestamptz | NOT NULL | now() | |
| processed | boolean | NOT NULL | false | |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users(id) ON DELETE CASCADE
**Indexes:** trendyol_webhook_events_user_received ON (user_id, received_at DESC)

---

### 1.22 blog_comments

**Purpose:** Blog post comments with moderation workflow. Comments are created as unapproved and must be approved by admin before display.

Note: This table has no migration file — it was created directly in the Supabase dashboard.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| post_slug | text | NOT NULL | — | Links to blog post by slug |
| author_name | text | NOT NULL | — | Max 100 chars |
| content | text | NOT NULL | — | Max 2000 chars |
| created_at | timestamptz | YES | now() | |
| is_approved | boolean | YES | false | Must be approved by admin |

**Primary Key:** id

---

## 2. TABLE RELATIONSHIPS

### Relationship Diagram

```
auth.users
  ├── profiles (1:1, ON DELETE CASCADE)
  ├── analyses (1:many, ON DELETE CASCADE)
  │     ├── notifications (many:1, ON DELETE CASCADE via analysis_id)
  │     ├── product_marketplace_map (many:1, ON DELETE SET NULL via internal_product_id)
  │     └── product_sales_metrics (many:1, ON DELETE CASCADE via internal_product_id)
  ├── notifications (1:many, ON DELETE CASCADE)
  ├── payments (1:many, ON DELETE CASCADE)
  ├── tickets (1:many, ON DELETE CASCADE)
  ├── admin_users (1:1, ON DELETE CASCADE)
  ├── email_logs (1:many, ON DELETE SET NULL)
  ├── cash_plan (1:many, ON DELETE CASCADE)
  ├── marketplace_connections (1:many, ON DELETE CASCADE)
  │     ├── marketplace_secrets (1:1, ON DELETE CASCADE)
  │     ├── marketplace_sync_logs (1:many, ON DELETE CASCADE)
  │     ├── trendyol_products_raw (1:many, ON DELETE CASCADE)
  │     ├── trendyol_orders_raw (1:many, ON DELETE CASCADE)
  │     ├── hepsiburada_products_raw (1:many, ON DELETE CASCADE)
  │     ├── hepsiburada_orders_raw (1:many, ON DELETE CASCADE)
  │     └── product_marketplace_map (1:many via connection_id, ON DELETE CASCADE)
  ├── product_marketplace_map (1:many, ON DELETE CASCADE)
  ├── product_sales_metrics (1:many, ON DELETE CASCADE)
  ├── trendyol_products_raw (1:many, ON DELETE CASCADE)
  ├── trendyol_orders_raw (1:many, ON DELETE CASCADE)
  ├── hepsiburada_products_raw (1:many, ON DELETE CASCADE)
  ├── hepsiburada_orders_raw (1:many, ON DELETE CASCADE)
  ├── hb_products (1:many, ON DELETE CASCADE)
  ├── hb_orders (1:many, ON DELETE CASCADE)
  ├── trendyol_webhook_events (1:many, ON DELETE CASCADE)
  └── commission_rates (1:many via profiles, ON DELETE CASCADE)

profiles
  └── commission_rates (1:many, ON DELETE CASCADE)
```

### Cascade Rules Summary

| Parent | Child | ON DELETE |
|--------|-------|-----------|
| auth.users | profiles | CASCADE |
| auth.users | analyses | CASCADE |
| auth.users | notifications | CASCADE |
| auth.users | payments | CASCADE |
| auth.users | tickets (support_tickets) | CASCADE |
| auth.users | admin_users | CASCADE |
| auth.users | email_logs | SET NULL |
| auth.users | cash_plan | CASCADE |
| auth.users | marketplace_connections | CASCADE |
| auth.users | all raw data tables | CASCADE |
| auth.users | trendyol_webhook_events | CASCADE |
| profiles | commission_rates | CASCADE |
| analyses | notifications (via analysis_id) | CASCADE |
| analyses | product_marketplace_map (via internal_product_id) | SET NULL |
| analyses | product_sales_metrics (via internal_product_id) | CASCADE |
| marketplace_connections | marketplace_secrets | CASCADE |
| marketplace_connections | marketplace_sync_logs | CASCADE |
| marketplace_connections | all raw data tables (via connection_id) | CASCADE |
| marketplace_connections | product_marketplace_map (via connection_id) | CASCADE |

Key difference: When an analysis is deleted, its product_marketplace_map entry is NOT deleted — the `internal_product_id` is simply set to NULL (SET NULL), preserving the external mapping for potential re-matching.

---

## 3. RLS POLICIES

### profiles
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own profile | SELECT | auth.uid() = id |
| Users can insert own profile | INSERT | auth.uid() = id |
| Users can update own profile | UPDATE | auth.uid() = id (USING + WITH CHECK) |

### analyses
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own analyses | SELECT | auth.uid() = user_id |
| Users can insert own analyses | INSERT | auth.uid() = user_id |
| Users can update own analyses | UPDATE | auth.uid() = user_id (USING + WITH CHECK) |
| Users can delete own analyses | DELETE | auth.uid() = user_id |

### notifications
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view their own notifications | SELECT | auth.uid() = user_id |
| Users can update their own notifications | UPDATE | auth.uid() = user_id |
| Users can delete their own notifications | DELETE | auth.uid() = user_id |
| Users can insert their own notifications | INSERT | auth.uid() = user_id |

### payments
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own payments | SELECT | auth.uid() = user_id |

No INSERT/UPDATE/DELETE policies — only service_role can create or modify payments.

### tickets (support_tickets)
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can insert own tickets | INSERT | auth.uid() = user_id |
| Users see own tickets, Admins see all | SELECT | auth.uid() = user_id OR user is in admin_users |
| Users update own, Admins update all | UPDATE | auth.uid() = user_id OR user is in admin_users |

### admin_users
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can read own admin status | SELECT | auth.uid() = user_id |

### email_logs
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own email logs | SELECT | auth.uid() = user_id |
| Users can insert own email logs | INSERT | auth.uid() = user_id |

### cash_plan
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view their own cash plan | SELECT | auth.uid() = user_id |
| Users can insert/update their own cash plan | ALL | auth.uid() = user_id |

### commission_rates
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can read their own rates | SELECT | auth.uid() = user_id |
| Users can insert their own rates | INSERT | auth.uid() = user_id |
| Users can update their own rates | UPDATE | auth.uid() = user_id |
| Users can delete their own rates | DELETE | auth.uid() = user_id |

### marketplace_connections
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own connections | SELECT | auth.uid() = user_id |
| Users can insert own connections | INSERT | auth.uid() = user_id |
| Users can update own connections | UPDATE | auth.uid() = user_id (USING + WITH CHECK) |
| Users can delete own connections | DELETE | auth.uid() = user_id |

### marketplace_secrets
RLS: **ENABLED — NO POLICIES**

No client access policies exist. This table is completely locked down. Only service_role (admin client) can read or write. This is intentional — encrypted API credentials must never be accessible from the client.

### marketplace_sync_logs
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own sync logs | SELECT | connection_id IN (SELECT id FROM marketplace_connections WHERE user_id = auth.uid()) |

No INSERT/UPDATE/DELETE policies — only service_role can write logs.

### product_marketplace_map
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own mappings | SELECT | auth.uid() = user_id |
| Users can update own mappings | UPDATE | auth.uid() = user_id (USING + WITH CHECK) |

No INSERT/DELETE from client — server only via service_role.

### product_sales_metrics
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own metrics | SELECT | auth.uid() = user_id |

No INSERT/UPDATE/DELETE from client — server only via service_role.

### trendyol_products_raw
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own products_raw | SELECT | auth.uid() = user_id |

No INSERT/UPDATE/DELETE from client — server only via service_role.

### trendyol_orders_raw
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own orders_raw | SELECT | auth.uid() = user_id |

No INSERT/UPDATE/DELETE from client — server only via service_role.

### hepsiburada_products_raw
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own hb products | SELECT | auth.uid() = user_id |
| Users can insert own hb products | INSERT | auth.uid() = user_id |
| Users can update own hb products | UPDATE | auth.uid() = user_id (USING + WITH CHECK) |
| Users can delete own hb products | DELETE | auth.uid() = user_id |

### hepsiburada_orders_raw
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own hb orders | SELECT | auth.uid() = user_id |
| Users can insert own hb orders | INSERT | auth.uid() = user_id |
| Users can update own hb orders | UPDATE | auth.uid() = user_id (USING + WITH CHECK) |
| Users can delete own hb orders | DELETE | auth.uid() = user_id |

### hb_products
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| kullanici_kendi_urunleri | ALL | auth.uid() = user_id |

### hb_orders
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| kullanici_kendi_siparisleri | ALL | auth.uid() = user_id |

### trendyol_webhook_events
RLS: **ENABLED**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| trendyol_webhook_events_select_own | SELECT | auth.uid() = user_id |

No INSERT/UPDATE/DELETE from client — server only via service_role.

---

## 4. ENUMS AND CONSTANTS

There are no PostgreSQL ENUM types defined. All constrained text fields use CHECK constraints with IN lists.

### profiles.plan
Possible values: `'free'`, `'starter'`, `'pro'`, `'pro_monthly'`, `'pro_yearly'`, `'admin'`

Note: The original migration CHECK only allows `('free', 'pro')`, but the application uses the wider set above. The CHECK constraint was likely relaxed or the column was altered.

### profiles.plan_type
Possible values: `'pro_monthly'`, `'pro_yearly'`, `'starter_monthly'`, `'starter_yearly'`, `NULL`

### analyses.risk_level
Possible values: `'safe'`, `'moderate'`, `'risky'`, `'dangerous'`

### analyses.marketplace
Possible values: `'trendyol'`, `'hepsiburada'`, `'n11'`, `'amazon_tr'`, `'custom'`

### analyses.target_position
Possible values: `'cheaper'`, `'same'`, `'premium'`, `NULL`

### analyses.marketplace_source
Possible values: `'manual'`, `'trendyol'`, `'hepsiburada'` (or other marketplace names)

### notifications.type
Possible values: `'danger'`, `'warning'`, `'info'`

### payments.plan
Possible values: `'pro_monthly'`, `'pro_yearly'`

Note: Code also uses `'starter_monthly'` and `'starter_yearly'`, but the CHECK constraint in the migration only allows `('pro_monthly', 'pro_yearly')`.

### payments.status
Possible values: `'created'`, `'paid'`, `'failed'`

Note: Code also uses `'expired'`, but the migration CHECK only defines `('created', 'paid', 'failed')`.

### tickets.category
Possible values: `'teknik'`, `'odeme'`, `'hesap'`, `'oneri'`, `'diger'`

### tickets.priority
Possible values: `'dusuk'`, `'normal'`, `'yuksek'`, `'acil'`

Note: The migration for `support_tickets` defines `('low', 'medium', 'high')`, but the actual `tickets` table used by the app uses Turkish values.

### tickets.status
Possible values: `'acik'`, `'inceleniyor'`, `'cevaplandi'`, `'kapali'`

Note: The migration for `support_tickets` defines `('open', 'in_progress', 'resolved', 'closed')`, but the actual `tickets` table uses Turkish values.

### marketplace_connections.status
Possible values: `'disconnected'`, `'connected'`, `'connected_demo'`, `'pending_test'`, `'error'`

### marketplace_connections.marketplace
Possible values: `'trendyol'`, `'hepsiburada'`

### marketplace_sync_logs.sync_type
Possible values: `'products'`, `'orders'`, `'test'`

### marketplace_sync_logs.status
Possible values: `'success'`, `'failed'`, `'running'`

### product_marketplace_map.match_confidence
Possible values: `'high'`, `'medium'`, `'manual_required'`

### email_logs.status
Possible values: `'sent'`, `'failed'`

---

## 5. JSONB FIELDS

### analyses.inputs (ProductInput)

Stores the full user input for a product analysis:
- `marketplace` — marketplace identifier
- `product_name` — product name string
- `monthly_sales_volume` — estimated monthly units sold
- `product_cost` — unit purchase cost
- `sale_price` — unit selling price (usually VAT-inclusive)
- `commission_pct` — commission percentage
- `shipping_cost` — shipping cost per unit
- `packaging_cost` — packaging cost per unit
- `ad_cost_per_sale` — advertising cost per unit sold
- `return_rate_pct` — expected return rate percentage
- `vat_pct` — VAT percentage (default 20)
- `other_cost` — other costs per unit
- `payout_delay_days` — marketplace payment delay in days
- `competitor_price`, `competitor_name`, `target_position` — optional competitor data
- `marketplace_category` — selected product category
- `n11_extra_pct` — n11 extra fee percentage
- `trendyol_service_fee` — Trendyol per-order service fee
- PRO mode fields: `pro_mode`, `sale_price_includes_vat`, `sale_vat_pct`, `product_cost_includes_vat`, `purchase_vat_pct`, `marketplace_fee_vat_pct`, `shipping_includes_vat`, `shipping_vat_pct`, `packaging_includes_vat`, `packaging_vat_pct`, `ad_includes_vat`, `ad_vat_pct`, `other_cost_includes_vat`, `other_cost_vat_pct`, `return_refunds_commission`, `return_extra_cost`, `accounting_mode`, `income_tax_pct`

### analyses.outputs (CalculationResult + _risk_factors)

Stores the calculated results:
- `commission_amount` — calculated commission in TL
- `vat_amount` — calculated VAT amount
- `expected_return_loss` — calculated return loss
- `service_fee_amount` — platform service fee
- `unit_variable_cost` — sum of all variable costs
- `unit_total_cost` — total cost per unit
- `unit_net_profit` — net profit per unit
- `margin_pct` — profit margin percentage
- `monthly_net_profit` — monthly net profit
- `monthly_revenue` — monthly revenue
- `monthly_total_cost` — monthly total cost
- `breakeven_price` — minimum viable price
- `sale_price` — the sale price used
- `sale_price_excl_vat` — sale price without VAT
- `output_vat_monthly`, `input_vat_monthly`, `vat_position_monthly`, `monthly_net_sales` — PRO mode VAT fields
- `_risk_factors` — array of risk factor objects, each with name, impact, and description

### payments.raw_payload

Full webhook response from PayTR. Structure varies but typically includes: `merchant_oid`, `status`, `total_amount`, `hash`, `callback_id`, and other PayTR-specific fields.

### trendyol_products_raw.raw_json / trendyol_orders_raw.raw_json

Full API response from Trendyol. Products include all product attributes. Orders include order lines, status history, cargo info, commission details.

### hepsiburada_products_raw.raw_json / hepsiburada_orders_raw.raw_json

Full API response from Hepsiburada. Similar structure to Trendyol raw data.

### trendyol_webhook_events.payload

Full Trendyol webhook event payload including event type, shipment/package details, and order status information.

### marketplace_secrets.encrypted_blob

AES-256-GCM encrypted JSON string. When decrypted, contains the marketplace API credentials (apiKey, apiSecret, sellerId for Trendyol; apiKey, apiSecret, merchantId for Hepsiburada). The blob itself is a JSON object with: `iv` (base64), `ciphertext` (base64), `tag` (base64), `version` (integer).

---

## 6. DATABASE FUNCTIONS AND TRIGGERS

### Functions

**handle_new_user()**
- Language: PL/pgSQL, SECURITY DEFINER
- Purpose: Automatically creates a `profiles` row when a new user registers in `auth.users`.
- Inserts: `id = NEW.id`, `email = NEW.email`, `plan = 'free'`

**handle_updated_at()**
- Language: PL/pgSQL
- Purpose: Generic trigger function that sets `updated_at = now()` on row update.
- Used by: `support_tickets`

**trigger_set_updated_at()**
- Language: PL/pgSQL
- Purpose: Same as above but defined in a different migration. Sets `NEW.updated_at = now()`.
- Used by: `marketplace_connections`, `marketplace_secrets`, `product_marketplace_map`, `product_sales_metrics`, `trendyol_products_raw`, `trendyol_orders_raw`

**handle_new_notification()**
- Language: PL/pgSQL, SECURITY DEFINER
- Purpose: When a notification with type `'danger'` is inserted, it fires an HTTP POST to a Supabase edge function to send a notification email.
- Uses: `net.http_post` (pg_net extension)

### Triggers

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| on_auth_user_created | auth.users | AFTER INSERT | handle_new_user() |
| set_updated_at | support_tickets | BEFORE UPDATE | handle_updated_at() |
| trg_mc_updated_at | marketplace_connections | BEFORE UPDATE | trigger_set_updated_at() |
| trg_ms_updated_at | marketplace_secrets | BEFORE UPDATE | trigger_set_updated_at() |
| trg_pmm_updated_at | product_marketplace_map | BEFORE UPDATE | trigger_set_updated_at() |
| trg_psm_updated_at | product_sales_metrics | BEFORE UPDATE | trigger_set_updated_at() |
| trg_tpr_updated_at | trendyol_products_raw | BEFORE UPDATE | trigger_set_updated_at() |
| trg_tor_updated_at | trendyol_orders_raw | BEFORE UPDATE | trigger_set_updated_at() |

Note: The `handle_new_notification` trigger for sending emails on danger-type notifications is defined as a function but the corresponding CREATE TRIGGER statement may have been added separately or via the Supabase dashboard.

---

## 7. MIGRATION ORDER

Migrations are listed in chronological order. The filename prefix is the timestamp.

| # | Migration File | Creates/Modifies | Dependencies |
|---|---------------|------------------|--------------|
| 1 | 20240214_add_competitor_fields.sql | Adds competitor columns to analyses | analyses must exist |
| 2 | 20240215_plan_system.sql | Adds plan columns to profiles | profiles must exist |
| 3 | 20240220_create_support_system.sql | Creates admin_users, support_tickets | auth.users |
| 4 | 20240223_create_email_logs.sql | Creates email_logs | auth.users |
| 5 | 20240225_create_payments.sql | Creates payments | auth.users |
| 6 | 20260213132642_create_profiles_and_analyses.sql | Creates profiles, analyses, handle_new_user trigger | auth.users |
| 7 | 20260214_create_notifications.sql | Creates notifications, handle_new_notification function | auth.users, analyses |
| 8 | 20260215_add_link_fields_to_notifications.sql | Adds product_id, href to notifications | notifications |
| 9 | 20260216_email_notifications.sql | Adds email preference columns to profiles | profiles |
| 10 | 20260217_general_store_modules.sql | Creates cash_plan, adds store columns to profiles | auth.users, profiles |
| 11 | 20260228_add_pro_until.sql | Adds pro_until to profiles | profiles |
| 12 | 20260306_marketplace_tables.sql | Creates marketplace_connections, marketplace_secrets, marketplace_sync_logs | auth.users |
| 13 | 20260306_trendyol_raw_tables.sql | Creates trendyol_products_raw, trendyol_orders_raw | auth.users, marketplace_connections |
| 14 | 20260306_marketplace_phase3.sql | Creates product_marketplace_map, adds columns to analyses | auth.users, analyses, marketplace_connections |
| 15 | 20260306_product_sales_metrics.sql | Creates product_sales_metrics | auth.users, analyses |
| 16 | 20260306_fix_pmm.sql | Adds connection_id to product_marketplace_map | product_marketplace_map, marketplace_connections |
| 17 | 20260306_demo_mode.sql | Adds 'connected_demo' to marketplace_connections status CHECK | marketplace_connections |
| 18 | 20260307_add_pro_meta.sql | Adds pro_expires_at, pro_renewal, pro_started_at to profiles | profiles |
| 19 | 20260307_hepsiburada_tables.sql | Creates hepsiburada_products_raw, hepsiburada_orders_raw | auth.users, marketplace_connections |
| 20 | 20260308_fix_pro_renewal_default.sql | Changes pro_renewal default from true to false | profiles |
| 21 | 20260312_add_paytr_columns_to_payments.sql | Adds email, currency columns to payments | payments |
| 22 | 20260313_add_is_pro_plan_type.sql | Adds is_pro, plan_type to profiles | profiles |
| 23 | 20260317_commission_rates.sql | Creates commission_rates | profiles |
| 24 | 20260326_hb_products_orders.sql | Creates hb_products, hb_orders | auth.users |
| 25 | 20260326_trendyol_webhook.sql | Creates trendyol_webhook_events, adds webhook_active to marketplace_connections | auth.users, marketplace_connections |

**Additional file (not in migrations/):**
- `supabase/fix_rls_policies.sql` — Idempotent RLS policy definitions for profiles, analyses, and notifications. Can be re-run safely.

### Table Dependency Chain

```
auth.users (Supabase managed)
  └── profiles (created by trigger)
        └── commission_rates

  └── analyses
        ├── product_marketplace_map (via internal_product_id)
        └── product_sales_metrics (via internal_product_id)

  └── marketplace_connections
        ├── marketplace_secrets
        ├── marketplace_sync_logs
        ├── trendyol_products_raw
        ├── trendyol_orders_raw
        ├── hepsiburada_products_raw
        ├── hepsiburada_orders_raw
        └── product_marketplace_map (via connection_id)

  └── notifications (optionally links to analyses)
  └── payments
  └── tickets
  └── email_logs
  └── cash_plan
  └── hb_products
  └── hb_orders
  └── trendyol_webhook_events
```

**blog_comments** has no migration and no foreign keys — it is a standalone table created directly in the Supabase dashboard.
