import { searchSite } from "@/lib/site-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Bound work for public, unauthenticated requests. Long/random query strings
  // otherwise create unique cache keys and repeatedly trigger database reads.
  const query = (searchParams.get("q")?.trim() || "").slice(0, 80);
  const requestedLimit = Number(searchParams.get("limit") || 8);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 12)
    : 8;

  return Response.json(
    {
      query,
      results:
        query.length >= 2 && query.split(/\s+/).length <= 8
          ? await searchSite(query, limit)
          : [],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
