import { createStaticPageMetadata } from "@/lib/seo";

import { PageHero } from "@/components/page-hero";
import { SearchResults } from "@/components/search/search-results";
import { searchSite } from "@/lib/site-search";

export const generateMetadata = createStaticPageMetadata("/search");

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = queryValue?.trim().slice(0, 160) || "";
  const results = query ? await searchSite(query, 1000) : [];

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Search" }]}
        title="Search ArLAR"
        description="One search across ArLAR news, people, groups, webinars, publications, educational resources, and patient information."
        grainId="search-page-grain"
      />
      <SearchResults query={query} results={results} />
    </main>
  );
}
