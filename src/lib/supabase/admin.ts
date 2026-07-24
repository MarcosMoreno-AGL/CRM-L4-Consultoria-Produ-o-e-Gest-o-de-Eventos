import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

// Server-only client using the secret key — bypasses RLS. Never import from client components.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
