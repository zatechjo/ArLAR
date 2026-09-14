import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  // Public locale redirects and rewrites are declarative in next.config.ts.
  // Only authenticated admin traffic needs a server-side Proxy invocation.
  matcher: ["/admin/:path*"],
};
