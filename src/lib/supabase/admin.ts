import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireSupabasePublicConfig } from "@/lib/supabase/config";

export function createSupabaseAdminClient() {
  const { url } = requireSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) is required to create administrator accounts.");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export function adminInvitationRedirectUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const origin = configured || (vercelHost ? `https://${vercelHost}` : "http://localhost:4010");
  return `${origin}/admin/accept-invite`;
}
