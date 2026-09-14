export type SupabasePublicConfig = {
  url: string;
  key: string;
};

/**
 * Public Supabase configuration. The publishable key is preferred; the legacy
 * anon key remains supported while the project is being migrated.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );

  if (!url || !key) return null;
  return { url, key };
}

export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a publishable/anon key.");
  }
  return config;
}
