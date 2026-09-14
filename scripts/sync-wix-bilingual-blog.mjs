import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const API_ROOT = "https://www.wixapis.com/blog/v3";
const SITE_LIST_ROOT = "https://www.wixapis.com/site-list/v2/sites";
const OUTPUT_DIR = path.join(ROOT, "data", "wix", "blog", "bilingual");

const DEFAULT_SITES = {
  en: { name: "arlaractual", locale: "en" },
  ar: { name: "website-2", locale: "ar" },
};

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^("|')(.*)\1$/, "$2")];
      }),
  );
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const details = (await response.text()).slice(0, 1000);
    throw new Error(`${options.method ?? "GET"} ${url} failed (${response.status}): ${details}`);
  }
  return response.json();
}

async function findSite(apiKey, accountId, configuredId, name) {
  if (configuredId) return { id: configuredId, name, source: "environment" };
  const response = await requestJson(`${SITE_LIST_ROOT}/query`, {
    method: "POST",
    headers: { Authorization: apiKey, "wix-account-id": accountId, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { filter: { name }, cursorPaging: { limit: 50 } } }),
  });
  const site = response.sites?.find((candidate) => candidate.name === name) ?? response.sites?.[0];
  if (!site) throw new Error(`Could not find Wix site ${name}.`);
  return site;
}

function recordsFrom(response, key) {
  return response[key] ?? response.items ?? response.data?.[key] ?? [];
}

function totalFrom(response, fallback) {
  return Number(response.metaData?.total ?? response.pagingMetadata?.total ?? response.paging?.total ?? response.totalResults ?? fallback);
}

async function listPosts(headers) {
  const records = [];
  const pages = [];
  const limit = 100;
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;
  while (offset < total) {
    // GET is intentional: the Arabic Wix site rejects the POST query variant.
    const url = `${API_ROOT}/posts?paging.limit=${limit}&paging.offset=${offset}`;
    const response = await requestJson(url, { headers });
    const page = recordsFrom(response, "posts");
    records.push(...page);
    pages.push({ url, response });
    total = totalFrom(response, records.length);
    offset += page.length;
    if (!page.length || page.length < limit) break;
  }
  return { records, pages, total: Number.isFinite(total) ? total : records.length };
}

async function getPost(headers, id) {
  const params = new URLSearchParams();
  ["RICH_CONTENT", "CONTENT_TEXT", "URL", "METRICS"].forEach((fieldset) => params.append("fieldsets", fieldset));
  const response = await requestJson(`${API_ROOT}/posts/${encodeURIComponent(id)}?${params}`, { headers });
  return response.post ?? response;
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const output = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      output[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return output;
}

function normalizePost(post, detail, site, locale) {
  const record = { ...post, ...detail };
  return {
    id: record.id ?? record._id,
    sourceSiteId: site.id,
    sourceSiteName: site.name,
    locale,
    title: record.title ?? "",
    slug: record.slug ?? "",
    excerpt: record.excerpt ?? record.customExcerpt ?? "",
    contentText: record.contentText ?? "",
    richContent: record.richContent ?? null,
    url: record.url ?? null,
    heroImage: record.heroImage ?? null,
    media: record.media ?? null,
    firstPublishedDate: record.firstPublishedDate ?? null,
    lastPublishedDate: record.lastPublishedDate ?? null,
    categoryIds: record.categoryIds ?? [],
    tagIds: record.tagIds ?? [],
    hashtags: record.hashtags ?? [],
    seoData: record.seoData ?? null,
    metrics: record.metrics ?? null,
    minutesToRead: record.minutesToRead ?? null,
    featured: record.featured ?? false,
    pinned: record.pinned ?? false,
    rawPost: record,
  };
}

function arabicCharacterCount(value) {
  return (value.match(/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/g) ?? []).length;
}

function latinCharacterCount(value) {
  return (value.match(/[A-Za-z]/g) ?? []).length;
}

function isArabicContent(post) {
  const sample = `${post.title} ${post.excerpt} ${post.contentText}`;
  const arabic = arabicCharacterCount(sample);
  const latin = latinCharacterCount(sample);
  return arabic >= 8 && arabic > latin;
}

function normalizeTitle(value) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function publishedTime(post) {
  const value = Date.parse(post.firstPublishedDate ?? post.lastPublishedDate ?? "");
  return Number.isFinite(value) ? value : null;
}

function findEnglishMatch(post, english, englishBySlug, englishByTitle) {
  const exactSlug = englishBySlug.get(post.slug);
  if (exactSlug) return { post: exactSlug, matchType: "slug", deltaMs: 0 };
  const exactTitle = englishByTitle.get(normalizeTitle(post.title));
  if (exactTitle) return { post: exactTitle, matchType: "title", deltaMs: 0 };

  // Wix copied many bilingual posts to both sites at the same moment while
  // giving them different localized slugs. A two-minute window catches those
  // pairs without merging unrelated posts from the same day.
  const publishedAt = publishedTime(post);
  if (publishedAt === null) return null;
  let best = null;
  for (const candidate of english) {
    const candidateTime = publishedTime(candidate);
    if (candidateTime === null) continue;
    const deltaMs = Math.abs(publishedAt - candidateTime);
    if (deltaMs <= 120_000 && (!best || deltaMs < best.deltaMs)) best = { post: candidate, matchType: "publish-time", deltaMs };
  }
  return best;
}

function buildMergeReport(english, arabic) {
  const englishBySlug = new Map(english.map((post) => [post.slug, post]));
  const englishByTitle = new Map(english.map((post) => [normalizeTitle(post.title), post]));
  const exactSlugPairs = [];
  const translationCandidates = [];
  const duplicateOrEnglish = [];
  const arabicOnly = [];
  const seen = new Set();

  for (const post of arabic) {
    const matchResult = findEnglishMatch(post, english, englishBySlug, englishByTitle);
    const match = matchResult?.post;
    const key = post.id;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!match) {
      arabicOnly.push({ post, reason: isArabicContent(post) ? "unique-arabic-article" : "unique-non-arabic-article" });
      continue;
    }
    exactSlugPairs.push({ arabicId: post.id, englishId: match.id, arabicSlug: post.slug, englishSlug: match.slug, matchType: matchResult.matchType, deltaMs: matchResult.deltaMs });
    if (isArabicContent(post)) translationCandidates.push({ english: match, arabic: post, matchType: matchResult.matchType, deltaMs: matchResult.deltaMs });
    else duplicateOrEnglish.push({ english: match, arabic: post, matchType: matchResult.matchType, deltaMs: matchResult.deltaMs });
  }

  return {
    counts: {
      english: english.length,
      arabic: arabic.length,
      exactOrTitlePairs: exactSlugPairs.length,
      translationCandidates: translationCandidates.length,
      duplicateOrEnglish: duplicateOrEnglish.length,
      arabicOnly: arabicOnly.length,
      arabicOnlyWithArabicContent: arabicOnly.filter((entry) => entry.reason === "unique-arabic-article").length,
    },
    exactOrTitlePairs: exactSlugPairs,
    translationCandidates: translationCandidates.map(({ english: en, arabic: ar, matchType, deltaMs }) => ({
      matchType,
      deltaMs,
      englishId: en.id,
      arabicId: ar.id,
      englishSlug: en.slug,
      arabicSlug: ar.slug,
      englishTitle: en.title,
      arabicTitle: ar.title,
    })),
    arabicOnly: arabicOnly.map(({ post, reason }) => ({ id: post.id, slug: post.slug, title: post.title, firstPublishedDate: post.firstPublishedDate, reason })),
    duplicateOrEnglish: duplicateOrEnglish.map(({ english: en, arabic: ar, matchType, deltaMs }) => ({ matchType, deltaMs, englishId: en.id, arabicId: ar.id, slug: ar.slug, title: ar.title })),
  };
}

function buildMergedPosts(english, arabic) {
  const englishBySlug = new Map(english.map((post) => [post.slug, post]));
  const englishByTitle = new Map(english.map((post) => [normalizeTitle(post.title), post]));
  const matchedArabicIds = new Set();
  const translationsByEnglishId = new Map();

  for (const post of arabic) {
    const matchResult = findEnglishMatch(post, english, englishBySlug, englishByTitle);
    const match = matchResult?.post;
    if (!match) continue;
    // Shared slugs that are English duplicates stay represented by the English
    // canonical record; only Arabic-content matches are attached as translations.
    matchedArabicIds.add(post.id);
    if (!isArabicContent(post)) continue;
    translationsByEnglishId.set(match.id, {
      title: post.title,
      body: post.contentText,
      richContent: post.richContent,
      excerpt: post.excerpt,
      sourcePostId: post.id,
      sourceSiteId: post.sourceSiteId,
      sourceSlug: post.slug,
      matchType: matchResult.matchType,
      matchDeltaMs: matchResult.deltaMs,
      firstPublishedDate: post.firstPublishedDate,
      lastPublishedDate: post.lastPublishedDate,
    });
  }

  const canonical = english.map((post) => ({
    ...post,
    locale: "en",
    translations: translationsByEnglishId.has(post.id)
      ? { ...(post.translations ?? {}), arabic: translationsByEnglishId.get(post.id) }
      : post.translations ?? {},
  }));
  const standaloneArabic = arabic
    .filter((post) => !matchedArabicIds.has(post.id))
    .map((post) => ({ ...post, locale: "ar", canonicalId: null }));
  return [...canonical, ...standaloneArabic];
}

async function exportSite(apiKey, site, locale) {
  const headers = { Authorization: apiKey, "wix-site-id": site.id, Accept: "application/json" };
  const listing = await listPosts(headers);
  const details = await mapWithConcurrency(listing.records, 6, (post) => getPost(headers, post.id ?? post._id));
  const posts = listing.records.map((post, index) => normalizePost(post, details[index], site, locale));
  return { site, locale, total: listing.total, pages: listing.pages, posts };
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  if (!env.WIX_API_KEY || !env.WIX_ACCOUNT_ID) throw new Error("WIX_API_KEY and WIX_ACCOUNT_ID must be set in .env.local.");
  await mkdir(OUTPUT_DIR, { recursive: true });

  const [englishSite, arabicSite] = await Promise.all([
    findSite(env.WIX_API_KEY, env.WIX_ACCOUNT_ID, env.WIX_SITE_ID, DEFAULT_SITES.en.name),
    findSite(env.WIX_API_KEY, env.WIX_ACCOUNT_ID, env.WIX_ARABIC_SITE_ID, DEFAULT_SITES.ar.name),
  ]);
  const [english, arabic] = await Promise.all([
    exportSite(env.WIX_API_KEY, englishSite, "en"),
    exportSite(env.WIX_API_KEY, arabicSite, "ar"),
  ]);
  const report = buildMergeReport(english.posts, arabic.posts);
  const mergedPosts = buildMergedPosts(english.posts, arabic.posts);
  const translationRecords = mergedPosts
    .filter((post) => post.locale === "en" && post.translations?.arabic)
    .map((post) => ({ id: post.id, slug: post.slug, arabic: post.translations.arabic }));
  const exportedAt = new Date().toISOString();
  const manifest = {
    source: "Wix Blog REST API",
    exportedAt,
    note: "Arabic and English are exported separately. The merged export attaches only Arabic-content pairs matched by exact slug/title or a strict two-minute publish-time window; English duplicates remain represented by the English canonical record.",
    sites: { en: { id: english.site.id, name: english.site.name }, ar: { id: arabic.site.id, name: arabic.site.name } },
    report,
    merged: {
      totalRecords: mergedPosts.length,
      canonicalEnglishRecords: english.posts.length,
      attachedArabicTranslations: report.counts.translationCandidates,
      standaloneArabicRecords: mergedPosts.filter((post) => post.locale === "ar").length,
    },
  };
  await Promise.all([
    writeFile(path.join(OUTPUT_DIR, "en.posts.json"), `${JSON.stringify({ exportedAt, ...english }, null, 2)}\n`),
    writeFile(path.join(OUTPUT_DIR, "ar.posts.json"), `${JSON.stringify({ exportedAt, ...arabic }, null, 2)}\n`),
    writeFile(path.join(OUTPUT_DIR, "merged.posts.json"), `${JSON.stringify({ exportedAt, posts: mergedPosts }, null, 2)}\n`),
    writeFile(path.join(OUTPUT_DIR, "translations.json"), `${JSON.stringify({ exportedAt, translations: translationRecords }, null, 2)}\n`),
    writeFile(path.join(OUTPUT_DIR, "merge-report.json"), `${JSON.stringify(manifest, null, 2)}\n`),
  ]);
  console.log(`English posts: ${english.posts.length}/${english.total}`);
  console.log(`Arabic posts: ${arabic.posts.length}/${arabic.total}`);
  console.log(`Translation candidates: ${report.counts.translationCandidates}`);
  console.log(`Arabic-only articles: ${report.counts.arabicOnly} (${report.counts.arabicOnlyWithArabicContent} Arabic-content posts)`);
  console.log(`Exported: ${path.relative(ROOT, OUTPUT_DIR)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
