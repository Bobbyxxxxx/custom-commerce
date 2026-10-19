import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses row-level security. Only use it for writes users must not be able to
// make themselves, such as recording a paid order after Paystack confirms it.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not set");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
