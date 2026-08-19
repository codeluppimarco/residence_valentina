import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Client con service_role: bypassa ogni RLS. Solo per route/server action
// che devono operare come amministratore (es. invito nuovi utenti via
// supabase.auth.admin.inviteUserByEmail). "server-only" fa fallire la build
// se questo file finisse per errore in un bundle client.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
