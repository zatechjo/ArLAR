import "server-only";

import type { NewsCardArticle } from "@/data/news";
import { listPublicNewsArticleCardsAsync } from "@/lib/admin-news-repository";
import { getManagedMemberCountriesAsync } from "@/lib/member-societies-repository";
import type { Locale } from "@/i18n/config";

export type MemberNewsPost = NewsCardArticle & {
  countryTags: string[];
};

function countryKey(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

async function getCountryTagMap() {
  const tags = new Map<string, string>();
  for (const country of await getManagedMemberCountriesAsync()) {
    tags.set(countryKey(country.country), country.country);
    if (country.country === "United Arab Emirates") tags.set("uae", country.country);
  }
  return tags;
}

/**
 * The members-events directory is a view of the public news collection. Any
 * published news article tagged with a member country appears here without a
 * second, page-specific archive that can drift out of date.
 */
export async function getMemberEventPosts(locale: Locale = "en"): Promise<MemberNewsPost[]> {
  const countryTags = await getCountryTagMap();

  return (await listPublicNewsArticleCardsAsync(locale)).flatMap((article) => {
    const tags = article.categories.flatMap((category) => {
      const canonical = countryTags.get(countryKey(category));
      return canonical ? [canonical] : [];
    });
    if (tags.length === 0) return [];

    return [{
      ...article,
      countryTags: [...new Set(tags)],
    }];
  }).toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}
