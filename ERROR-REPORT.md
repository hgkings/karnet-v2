# ERROR REPORT — Kârnet

Comprehensive audit of bugs, missing features, security gaps, and code quality issues across the entire Kârnet codebase.

---

## 1. MOBILE UI BUGS

### BUG-M01: Pricing Page 4-Column Grid Overflows on Mobile
- **Page:** `/pricing`
- **File:** `app/pricing/page.tsx` (line 341)
- **Problem:** `grid grid-cols-4` for the feature comparison table forces 4 columns on all screen sizes. On mobile (< 640px), columns are squeezed to ~90px each, making feature names unreadable and prices overlap.
- **Should do:** Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` or switch to a card-based layout on mobile.
- **Severity:** Critical

### BUG-M02: Products Table Has No Horizontal Scroll Wrapper
- **Page:** `/dashboard`
- **File:** `components/dashboard/products-table.tsx`
- **Problem:** The products table (product name, marketplace, profit, margin, risk columns) has no `overflow-x-auto` wrapper. On screens under 640px, table columns overflow off-screen to the right with no way to scroll.
- **Should do:** Wrap the table in a `div` with `overflow-x-auto` class.
- **Severity:** Critical

### BUG-M03: Comparison Table Forces Minimum Width Without Scroll Hint
- **Page:** `/` (landing page)
- **File:** `components/landing/comparison-table.tsx` (line 72)
- **Problem:** Table has `min-w-[560px]` which forces horizontal scroll on mobile, but there is no visual indicator that the table can be scrolled horizontally. Users may not discover the hidden content.
- **Should do:** Add a scroll shadow or "swipe to see more" indicator on mobile, or stack the table into cards.
- **Severity:** High

### BUG-M04: Dashboard Sidebar Has No Mobile Drawer
- **Page:** `/dashboard`, `/analysis/*`, `/marketplace`, `/account`
- **File:** `components/layout/dashboard-layout.tsx` (line 42–52)
- **Problem:** The sidebar is `hidden md:fixed` — it completely disappears on mobile. Navigation is only available through the navbar's mobile hamburger menu. There is no slide-out drawer for dashboard navigation on mobile.
- **Should do:** Add a mobile drawer/sheet component that slides in from the left when a hamburger icon is tapped, showing the full sidebar navigation.
- **Severity:** High

### BUG-M05: Sidebar Touch Targets Too Small
- **Page:** All dashboard pages
- **File:** `components/layout/sidebar.tsx`
- **Problem:** Navigation items have `px-3 py-2.5` padding, resulting in approximately 35px height. Apple's HIG and Google's Material Design both recommend minimum 44px touch targets.
- **Should do:** Increase to `py-3` or `py-3.5` for at least 44px touch height.
- **Severity:** High

### BUG-M06: Hero Section Text Too Large on Small Mobile
- **Page:** `/` (landing page)
- **File:** `components/landing/hero.tsx` (line 54)
- **Problem:** Title uses `text-4xl sm:text-5xl lg:text-[3.4rem]`. On devices under 375px (e.g., iPhone SE), `text-4xl` (36px) causes line breaks in single words and leaves very little horizontal space.
- **Should do:** Use `text-2xl sm:text-3xl md:text-4xl lg:text-[3.4rem]` for a smoother progression.
- **Severity:** Medium

### BUG-M07: Analysis Detail Right Sidebar Text Cramped on Mobile
- **Page:** `/analysis/[id]`
- **File:** `app/analysis/[id]/page.tsx` (line 378)
- **Problem:** The grid is `grid-cols-1 lg:grid-cols-12`. On mobile, the right column (risk card, recommendations) stacks below but cards inside use fixed text sizes like `text-[10px]` for risk factors, which is too small to read.
- **Should do:** Use `text-xs sm:text-[10px]` and ensure cards have adequate padding.
- **Severity:** Medium

### BUG-M08: Small Font Sizes Across Multiple Components
- **Pages:** `/analysis/[id]`, `/dashboard`
- **Files:** `app/analysis/[id]/page.tsx` (line 547), `components/dashboard/pareto-chart.tsx` (line 68)
- **Problem:** Multiple components use `text-[10px]` or `text-[9px]` without responsive variants. These are below the minimum readable size on mobile devices.
- **Should do:** Use minimum `text-xs` (12px) on mobile, only shrink to 10px on larger screens.
- **Severity:** Medium

### BUG-M09: Admin Dashboard 5-Column KPI Grid Cramped
- **Page:** `/admin`
- **File:** `app/admin/page.tsx` (line 98)
- **Problem:** `grid grid-cols-2 lg:grid-cols-5` — on tablet (md), 2 columns is fine, but on large screens 5 columns makes each KPI card very narrow (< 200px). Values with long Turkish text truncate.
- **Should do:** Use `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` for a better progression.
- **Severity:** Low

### BUG-M10: Account Page Slider Not Touch-Friendly
- **Page:** `/account`
- **File:** `app/account/page.tsx` (line 247–254)
- **Problem:** The margin target slider has a small thumb size that is difficult to accurately drag on mobile touch screens.
- **Should do:** Increase slider thumb size to at least 44px on mobile.
- **Severity:** Low

---

## 2. UI/UX MISSING FEATURES

### BUG-U01: Analysis Delete Has No Confirmation Dialog
- **Page:** `/dashboard`
- **File:** `app/dashboard/page.tsx` (line 38–50)
- **Problem:** `handleDelete()` calls the DELETE API directly without asking the user to confirm. One accidental tap permanently deletes the analysis with no undo.
- **Should do:** Show an AlertDialog with "Bu analizi silmek istediğinize emin misiniz?" before proceeding.
- **Severity:** Critical

### BUG-U02: Marketplace Disconnect Has No Confirmation Dialog
- **Page:** `/marketplace`
- **File:** `app/marketplace/page.tsx`
- **Problem:** The disconnect button sends a DELETE request immediately without confirmation. Disconnecting deletes all synced data (products, orders, connection record).
- **Should do:** Show a destructive action dialog explaining what data will be lost.
- **Severity:** Critical

### BUG-U03: Analysis Form Submit Button Not Disabled During Save
- **Page:** `/analysis/new`
- **File:** `components/analysis/analysis-form.tsx` (line ~287)
- **Problem:** While `setLoading(true)` is called, the button's disabled state is not clearly enforced. Users can click submit multiple times rapidly, creating duplicate analyses.
- **Should do:** Add `disabled={loading}` to the submit button and show a spinner icon.
- **Severity:** High

### BUG-U04: Dashboard Missing Loading Skeleton
- **Page:** `/dashboard`
- **File:** `app/dashboard/page.tsx` (lines 69–78)
- **Problem:** Shows only a basic spinner while analyses load. No skeleton placeholders for KPI cards, product table, or charts. The page appears blank and then suddenly fills in.
- **Should do:** Show skeleton cards and skeleton table rows during loading for a smoother experience.
- **Severity:** High

### BUG-U05: Marketplace Page Missing Loading State for Connection Fetch
- **Page:** `/marketplace`
- **File:** `app/marketplace/page.tsx` (line 100)
- **Problem:** Connection status is fetched on load but no visual feedback is shown while fetching. The connect/disconnect button state is undefined briefly.
- **Should do:** Show a loading spinner or skeleton while connection status loads.
- **Severity:** Medium

### BUG-U06: Notification Drawer Has No Empty State
- **Page:** All dashboard pages (notification bell)
- **Problem:** When a user has zero notifications, the notification drawer shows an empty list with no helpful message.
- **Should do:** Show "Bildirim yok — hepsi tamam!" with an icon when the list is empty.
- **Severity:** Medium

### BUG-U07: Support Ticket Form Missing Loading Spinner on Button
- **Page:** `/support`
- **File:** `components/support/ticket-form.tsx` (line 47)
- **Problem:** `setLoading(true)` disables the button but shows no spinner/loader icon. Users don't know submission is in progress.
- **Should do:** Add a `<Loader2 className="animate-spin" />` icon to the button during loading.
- **Severity:** Medium

### BUG-U08: Analysis Form Missing Required Field Indicators
- **Page:** `/analysis/new`
- **File:** `components/analysis/analysis-form.tsx` (lines 215–240)
- **Problem:** Required fields (product name, sale price) are not marked with a visual asterisk (*) indicator. Users must submit to discover which fields are required.
- **Should do:** Add red asterisk to required field labels.
- **Severity:** Medium

### BUG-U09: Marketplace Credential Form Missing "Required" Indicators
- **Page:** `/marketplace`
- **File:** `app/marketplace/page.tsx`
- **Problem:** API Key, API Secret, and Seller ID inputs lack `required` attribute and visual indicators. Users submit incomplete credentials and get a cryptic error response.
- **Should do:** Add required labels and validate before submission.
- **Severity:** Medium

### BUG-U10: PDF Font Fallback Silent — No User Warning
- **Page:** `/analysis/[id]` (PDF download)
- **File:** `app/api/pdf/analysis/[id]/route.ts` (lines 151–163)
- **Problem:** When Ubuntu fonts fail to load from CDN, the system falls back to Helvetica silently. Turkish characters (ğ, ş, ı, ö, ç, ü, İ) may display incorrectly, but the user receives no warning.
- **Should do:** Add a note at the bottom of the PDF: "Font yüklenemedi — bazı Türkçe karakterler hatalı olabilir." or retry font load.
- **Severity:** Low

### BUG-U11: Blog Comment Rejection Has No Confirmation
- **Page:** `/admin/comments`
- **File:** `app/admin/comments/page.tsx`
- **Problem:** Admin can delete a comment with a single click — no "Are you sure?" dialog.
- **Should do:** Add confirmation before destructive rejection action.
- **Severity:** Low

---

## 3. BUSINESS LOGIC BUGS

### BUG-B01: PDF Monthly Download Limit Not Enforced Server-Side
- **File:** `app/api/pdf/analysis/[id]/route.ts`
- **Problem:** `config/plans.ts` defines `pdfReportMonthly: 0 (free), 5 (starter), Infinity (pro)`, but the PDF API route only checks authentication and ownership. It does NOT check how many PDFs the user has downloaded this month. There is no `pdf_downloads` counter in the database.
- **Should do:** Track PDF downloads in a table or counter column. Check against plan limit before generating. Return 403 with upgrade prompt if limit exceeded.
- **Severity:** High

### BUG-B02: Payment + Profile Update Not Atomic
- **File:** `app/api/paytr/callback/route.ts` (lines 90–126)
- **Problem:** The callback first updates `payments.status = 'paid'` (line 92–98), then separately updates `profiles.plan = 'pro'` (line 115–126). If the second update fails (e.g., database timeout), the payment is marked as paid but the user's plan is NOT upgraded. There is no transaction wrapping both operations.
- **Should do:** Use a Supabase RPC function or database transaction to atomically update both tables.
- **Severity:** High

### BUG-B03: Analysis Count Check Has Race Condition
- **File:** `lib/plan.ts`, `components/analysis/analysis-form.tsx` (lines 290–298)
- **Problem:** The system checks the current analysis count, verifies it's under the limit, then inserts. Between the check and the insert, a user with two open tabs could submit simultaneously and bypass the limit (e.g., creating a 4th analysis on the free plan).
- **Should do:** Use a database-level constraint or `SELECT ... FOR UPDATE` in a transaction before insert.
- **Severity:** Medium

### BUG-B04: Payment Token Expiry Not Checked on Callback
- **File:** `app/api/paytr/callback/route.ts`
- **Problem:** The callback route checks the hash and updates payment status, but does NOT verify whether `payment.token_expires_at` has passed. A payment callback received 30 minutes after token creation (well past the 15-minute window) is still accepted.
- **Should do:** Check `if (new Date(payment.token_expires_at) < new Date()) return 'OK'` and log a warning. The verify-payment endpoint correctly checks expiry, but the callback does not.
- **Severity:** Medium

### BUG-B05: Pro Renewal Not Implemented
- **File:** `app/api/paytr/callback/route.ts` (line 124)
- **Problem:** Sets `pro_renewal: false` on payment, and the `profiles` table has a `pro_renewal` column, but there is no code anywhere that checks this field or implements auto-renewal. Users must manually re-subscribe when their plan expires.
- **Should do:** Either implement auto-renewal via PayTR recurring payments, or remove the `pro_renewal` field to avoid confusion.
- **Severity:** Low

### BUG-B06: Marketplace Sync Partial Failure Not Rolled Back
- **File:** `app/api/marketplace/trendyol/sync-products/route.ts` (lines 43–65)
- **Problem:** Products are upserted one-by-one in a loop. If product #500 fails, the first 499 are already saved. The user sees "sync successful" but has incomplete data.
- **Should do:** Log failed product IDs, return them in the response, and show partial-sync warnings to the user.
- **Severity:** Medium

---

## 4. SECURITY GAPS

### BUG-S01: Blog Comment POST Has No Rate Limiting
- **File:** `app/api/blog/comments/route.ts`
- **Problem:** The endpoint accepts unlimited POST requests from any IP. There is no rate limiting, no CAPTCHA, no honeypot, and no auth requirement. An attacker can flood the blog with thousands of spam comments.
- **Should do:** Add IP-based rate limiting (e.g., 3 comments per minute per IP). Consider adding a honeypot field.
- **Severity:** Critical

### BUG-S02: Marketplace Sync Routes Missing Rate Limiting
- **Files:** `app/api/marketplace/trendyol/sync-products/route.ts`, `app/api/marketplace/trendyol/sync-orders/route.ts`, `app/api/marketplace/hepsiburada/sync-products/route.ts`, `app/api/marketplace/hepsiburada/sync-orders/route.ts`
- **Problem:** No rate limiting on sync endpoints. An authenticated user could hammer the sync button repeatedly, causing: excessive database writes, exhaustion of Trendyol/Hepsiburada API quotas, and potential API ban for the seller account.
- **Should do:** Rate limit to 1 sync per type per 5 minutes per user.
- **Severity:** Critical

### BUG-S03: Notification Routes Missing Rate Limiting
- **Files:** `app/api/notifications/route.ts` (GET, POST), `app/api/notifications/[id]/read/route.ts` (PATCH), `app/api/notifications/read-all/route.ts`
- **Problem:** Auth-required but no rate limit. A user could fire thousands of requests per second to mark notifications or create them.
- **Should do:** Add `apiRateLimit.limit(userId)` check.
- **Severity:** High

### BUG-S04: Payment Verification Endpoint No Rate Limiting
- **Files:** `app/api/paytr/check-payment/route.ts`, `app/api/verify-payment/route.ts`
- **Problem:** No rate limiting. The success page polls every 5 seconds (by design), but an attacker could poll much faster or enumerate payment IDs.
- **Should do:** Rate limit to 12 requests per minute per IP.
- **Severity:** High

### BUG-S05: Marketplace Connection DELETE Missing Ownership Check
- **File:** `app/api/marketplace/trendyol/route.ts` (DELETE handler)
- **Problem:** The DELETE handler uses the admin client to delete the connection, and checks that the user is authenticated, but may not verify that the connection belongs to the authenticated user. If connection IDs can be enumerated, User A could delete User B's marketplace connection (IDOR vulnerability).
- **Should do:** Add explicit check: `if (connection.user_id !== user.id) return 403`.
- **Severity:** High

### BUG-S06: Admin Routes Missing Rate Limiting
- **Files:** `app/api/admin/users/route.ts`, `app/api/admin/payments/route.ts`, `app/api/admin/support/tickets/route.ts`, `app/api/admin/blog-comments/route.ts`
- **Problem:** Admin endpoints verify admin status but have no rate limiting. A compromised admin session could make unlimited destructive changes.
- **Should do:** Rate limit admin actions to 120 requests per minute per admin.
- **Severity:** Medium

### BUG-S07: Marketplace Credentials Not Format-Validated
- **Files:** `app/api/marketplace/trendyol/route.ts` (line 54–62), `app/api/marketplace/hepsiburada/route.ts` (line 52–60)
- **Problem:** Checks `!apiKey || !apiSecret` but does not validate format or minimum length. Empty strings passed as truthy values would be accepted and encrypted.
- **Should do:** Validate minimum length (e.g., `apiKey.trim().length >= 10`) and expected format.
- **Severity:** Medium

### BUG-S08: PAYTR_SKIP_HASH Environment Variable Risk
- **File:** `app/api/paytr/callback/route.ts`
- **Problem:** Setting `PAYTR_SKIP_HASH=1` disables hash verification on payment callbacks. If this environment variable is accidentally left enabled in production, any attacker could forge payment callbacks and grant themselves Pro access.
- **Should do:** Remove this flag entirely, or gate it behind `NODE_ENV === 'development'` with a prominent warning log.
- **Severity:** Medium

### BUG-S09: Blog Comment POST Lacks CSRF Protection
- **File:** `app/api/blog/comments/route.ts`
- **Problem:** The endpoint accepts POST requests from any origin without CSRF token validation. An attacker could craft a page that submits comments on behalf of a visiting user's IP.
- **Should do:** Implement CSRF token or check `Origin`/`Referer` headers.
- **Severity:** Low

---

## 5. PERFORMANCE ISSUES

### BUG-P01: Admin Support Tickets Query Returns All Rows Without Server Pagination
- **File:** `dal/support.ts` (line 56–78)
- **Problem:** `getAllTickets()` does not use `.range()` or `.limit()`. It loads ALL tickets from the database into memory and returns them to the API route. As ticket volume grows (hundreds or thousands), this will cause slow responses and high memory usage.
- **Should do:** Implement server-side pagination with `.range(offset, offset + pageSize)`.
- **Severity:** High

### BUG-P02: AuthContext Value Not Memoized — Cascading Re-renders
- **File:** `contexts/auth-context.tsx` (line 103)
- **Problem:** The context value object `{ user, loading, login, register, logout, upgradePlan, refreshUser, updateProfile }` is created as a new object on every render. Every component that calls `useAuth()` will re-render whenever the AuthProvider re-renders, even if no values changed.
- **Should do:** Wrap the value in `useMemo()` with proper dependencies.
- **Severity:** Medium

### BUG-P03: Notification Query Hardcoded to 50 Without Pagination
- **File:** `dal/notifications.ts` (line 3–11)
- **Problem:** `getNotificationsByUserId()` has a hardcoded `.limit(50)` without any offset or cursor-based pagination. Users with more than 50 notifications can never see older ones.
- **Should do:** Add offset parameter and implement "load more" in the frontend.
- **Severity:** Medium

### BUG-P04: Admin Payments API Makes Two Separate Queries
- **File:** `app/api/admin/payments/route.ts` (line 17–28)
- **Problem:** First fetches payments, then extracts user IDs and fetches profiles separately. This is two round-trips to the database instead of one join.
- **Should do:** Use a single query with Supabase join or RPC function.
- **Severity:** Low

### BUG-P05: Dashboard Marketplace Fetch Error Silently Swallowed
- **File:** `app/dashboard/page.tsx` (line 29–35)
- **Problem:** `.catch(() => {})` silently suppresses all errors from the marketplace connection fetch. No error logging, no user feedback, no retry.
- **Should do:** Log the error and optionally show a toast: "Pazaryeri bağlantı durumu yüklenemedi."
- **Severity:** Low

---

## 6. MISSING FEATURES (V2 TODO)

### TODO-01: Support Ticket Email Notifications
- **Status:** Not implemented
- **Problem:** When an admin replies to a support ticket, the user receives no email notification. No email template exists for ticket replies. Users must manually check the `/support` page.
- **Should do:** Create email templates for: ticket created confirmation, admin reply notification. Send via Brevo SMTP when `admin_reply` is set.
- **Severity:** High

### TODO-02: PDF Monthly Limit Server Enforcement
- **Status:** Config defined, not enforced
- **Problem:** `config/plans.ts` defines `pdfReportMonthly` limits per plan, but no server-side tracking or enforcement exists. Client-side only blocks free users with an upgrade modal.
- **Should do:** Create a `pdf_downloads` table or counter column. Check against limit in the PDF API route. Track `downloaded_at` timestamp for monthly windowing.
- **Severity:** High

### TODO-03: Weekly Report Trigger Mechanism
- **Status:** Template exists, no trigger
- **Problem:** The email template `getWeeklyReportTemplate()` exists in `lib/email/templates/notifications.ts`, and the plan config has `weeklyEmailReport: boolean`, but there is no cron job, scheduler, or trigger to actually send weekly reports.
- **Should do:** Create a cron endpoint `GET /api/cron/weekly-report` that queries users with `email_weekly_report = true`, aggregates their analysis data, and sends the report email.
- **Severity:** Medium

### TODO-04: Blog Comment Rate Limiting / Spam Prevention
- **Status:** Not implemented
- **Problem:** Blog comments have no rate limiting, CAPTCHA, or honeypot. The moderation queue exists but could be overwhelmed by spam.
- **Should do:** Add IP-based rate limiting and optionally a honeypot hidden field.
- **Severity:** Medium

### TODO-05: Email Verification Activation
- **Status:** Infrastructure exists, feature disabled
- **File:** `app/auth/verify-email/page.tsx` (line 1–4, TODO comment)
- **Problem:** Email verification is disabled. Users can register with any email (even non-existent ones) and immediately access the dashboard.
- **Should do:** Enable "Confirm email" in Supabase Auth settings, redirect registration flow through `/auth/verify-email`, and re-enable the verification page.
- **Severity:** Medium

### TODO-06: Blog Admin CRUD Panel
- **Status:** Not implemented
- **Problem:** Blog posts are hardcoded in `lib/blog.ts` as a static TypeScript array. Adding, editing, or deleting posts requires a developer to modify code and redeploy.
- **Should do:** Create a `blog_posts` database table and an admin CRUD interface at `/admin/blog`.
- **Severity:** Low

### TODO-07: Pro Plan Auto-Renewal
- **Status:** Data field exists, logic not implemented
- **Problem:** The `pro_renewal` column in `profiles` exists and is set to `false` on payment, but no code reads it or implements renewal logic.
- **Should do:** Either implement renewal via PayTR recurring payments or remove the field.
- **Severity:** Low

---

## 7. CODE QUALITY ISSUES

### BUG-C01: TypeScript `any` Usage Across Codebase (20+ instances)
- **Files:**
  - `app/admin/payments/page.tsx:140` — `(p.profiles as any)?.email`
  - `app/analysis/[id]/page.tsx:606` — `onValueChange={(v: any) => setTargetPos(v)}`
  - `app/api/admin/activate-payment/route.ts:81` — `catch (error: any)`
  - `app/api/admin/support/route.ts:22,31,34` — multiple `any` casts
  - `app/api/analyses/route.ts:22,60` — error type `any`
  - `lib/auth.ts:14` — `function mapProfileRow(data: any)`
- **Problem:** `any` defeats TypeScript's type safety. Bugs can hide behind `any` casts.
- **Should do:** Replace with proper types. For errors, use `catch (error: unknown)` and narrow.
- **Severity:** Medium

### BUG-C02: Inconsistent API Response Format
- **Problem:** Some API routes return `{ error: "message" }`, others return `{ success: false, error: "message" }`, and some use only HTTP status codes without a body. This makes frontend error handling inconsistent.
- **Examples:**
  - `app/api/analyses/route.ts` returns `{ error: ... }`
  - `app/api/admin/users/route.ts` returns `{ success: false, error: ... }`
  - `app/api/support/tickets/route.ts` returns `{ success: true, data: ... }`
- **Should do:** Standardize all routes to return `{ success: boolean, data?: ..., error?: string }`.
- **Severity:** Medium

### BUG-C03: Table Name Mismatch — support_tickets vs tickets
- **Files:** `supabase/migrations/20240220_create_support_system.sql` creates `support_tickets`, but `dal/support.ts` and all API routes reference `tickets`.
- **Problem:** The migration and the runtime code use different table names. The app works because the actual table in production is named `tickets` (likely renamed manually in Supabase), but the migration is misleading and would fail on a fresh database setup.
- **Should do:** Rename the migration table to `tickets` or update all code references to `support_tickets`.
- **Severity:** Medium

### BUG-C04: Plan CHECK Constraint Does Not Match Actual Values
- **File:** `supabase/migrations/20260213132642_create_profiles_and_analyses.sql`
- **Problem:** The `profiles.plan` CHECK constraint only allows `('free', 'pro')`, but the application uses `'starter'`, `'pro_monthly'`, `'pro_yearly'`, and `'admin'`. The constraint was likely relaxed or removed in Supabase directly, but the migration is incorrect for fresh deployments.
- **Should do:** Update the migration to include all valid plan values.
- **Severity:** Medium

### BUG-C05: Payments Plan CHECK Constraint Too Narrow
- **File:** `supabase/migrations/20240225_create_payments.sql`
- **Problem:** The `payments.plan` CHECK only allows `('pro_monthly', 'pro_yearly')`, but the application now also creates `'starter_monthly'` and `'starter_yearly'` payments.
- **Should do:** Update the CHECK to include all 4 plan types.
- **Severity:** Medium

### BUG-C06: Dashboard Fetch Error Silently Suppressed
- **File:** `app/dashboard/page.tsx` (line 29–35)
- **Problem:** `.catch(() => {})` completely swallows errors from the marketplace connection fetch. No logging, no user feedback. If the API is down, the user sees no indication.
- **Should do:** At minimum, log the error. Optionally show a non-blocking toast.
- **Severity:** Low

### BUG-C07: Console Logging in lib/plan.ts
- **File:** `lib/plan.ts` (lines 28, 37, 48, 60, 70)
- **Problem:** Multiple `console.log()` and `console.error()` calls. They are wrapped in `if (process.env.NODE_ENV === 'development')` guards, so they're safe for production, but add code clutter.
- **Should do:** Remove or replace with a proper logging library.
- **Severity:** Low

### BUG-C08: Possible Unused File — lib/email-templates.ts
- **File:** `lib/email-templates.ts`
- **Problem:** This file exists but may not be imported anywhere. The actual email templates are in `lib/email/templates/`. This could be a leftover from an earlier implementation.
- **Should do:** Verify if imported anywhere. If not, delete it.
- **Severity:** Low
