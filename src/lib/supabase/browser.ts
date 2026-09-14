"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, key } = requireSupabasePublicConfig();
  browserClient = createBrowserClient(url, key);
  return browserClient;
}
