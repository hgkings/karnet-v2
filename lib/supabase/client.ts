import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client — anon key, RLS uygulanir.
 * Sadece client component'lerde kullanilir.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanimlanmamis'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
