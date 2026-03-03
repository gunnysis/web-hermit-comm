import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.gen'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
  )
}
