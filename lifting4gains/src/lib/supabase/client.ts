import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Browser/anon client. Returns null when Supabase isn't configured, which is
 * the default local-development state — callers fall back to the bundled
 * catalog rather than throwing.
 */
export function getSupabaseAnon(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/**
 * Service-role client. Server-only: this key bypasses RLS, so it must never be
 * imported into a client component.
 */
export function getSupabaseService(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
