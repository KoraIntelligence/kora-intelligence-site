// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Base environment variables
 * - Public keys for browser client
 * - Service key (server-only)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * ✅ Browser client — used for all client-side operations
 * Protected by Row Level Security (RLS)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * ✅ Admin client — used only server-side (API routes, edge functions)
 * Bypasses RLS with the Service Role key
 * DO NOT import this in client components.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // server-only
  },
});

/**
 * Optional: Type hinting for your DB schema
 * (Generated via `supabase gen types typescript --project-id <id>`)
 * 
 * Example:
 * import type { Database } from "@/lib/database.types";
 * export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
 */