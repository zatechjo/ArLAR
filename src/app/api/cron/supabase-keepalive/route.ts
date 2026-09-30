import { createSupabasePublicDataClient } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

const KEEPALIVE_QUERY_COUNT = 3;

const responseHeaders = {
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: responseHeaders });
  }

  const supabase = createSupabasePublicDataClient();
  if (!supabase) {
    console.error("[supabase-keepalive] Public Supabase configuration is missing.");
    return Response.json({ ok: false }, { status: 503, headers: responseHeaders });
  }

  for (let attempt = 0; attempt < KEEPALIVE_QUERY_COUNT; attempt += 1) {
    const { error } = await supabase
      .from("site_content")
      .select("content_key")
      .eq("status", "published")
      .limit(1);

    if (error) {
      console.error("[supabase-keepalive] Database query failed.", {
        attempt: attempt + 1,
        code: error.code,
        message: error.message,
      });
      return Response.json({ ok: false }, { status: 503, headers: responseHeaders });
    }
  }

  return Response.json(
    { ok: true, queries: KEEPALIVE_QUERY_COUNT, checkedAt: new Date().toISOString() },
    { headers: responseHeaders },
  );
}
