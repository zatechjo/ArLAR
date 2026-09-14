import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

let publicDataClient: SupabaseClient | null | undefined;
const reportedFallbackScopes = new Set<string>();

/** Cookie-free client for published website content and static generation. */
export function createSupabasePublicDataClient() {
  if (publicDataClient !== undefined) return publicDataClient;
  const config = getSupabasePublicConfig();
  if (!config) {
    publicDataClient = null;
    return null;
  }

  publicDataClient = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return publicDataClient;
}

export async function getCurrentAdminProfileId(client: SupabaseClient) {
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new Error("Your Supabase session has expired. Sign in again and retry.");
  const { data: profile, error } = await client
    .from("admin_profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (error || !profile) throw error || new Error("Your active administrator profile could not be found.");
  return profile.id as string;
}

export function reportSupabaseReadFallback(scope: string, error: unknown) {
  if (reportedFallbackScopes.has(scope)) return;
  reportedFallbackScopes.add(scope);
  const detail = error instanceof Error
    ? { name: error.name, message: error.message, cause: error.cause }
    : error && typeof error === "object"
      ? error
      : { message: String(error) };
  console.error(`[${scope}] Supabase read failed; using the local development fallback`, detail);
}
