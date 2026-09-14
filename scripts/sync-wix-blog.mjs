import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const SITE_NAME = "arlaractual";
const API_ROOT = "https://www.wixapis.com/blog/v3";
const RAW_DIR = path.join(ROOT, "data", "wix", "blog");
const MEDIA_DIR = path.join(ROOT, "public", "images", "wix-blog", "originals");
const NORMALIZED_PATH = path.join(ROOT, "src", "data", "blog-posts.json");

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator).trim();
        const value = line
          .slice(separator + 1)
          .trim()
          .replace(/^(\"|')(.*)\1$/, "$2");
        return [key, value];
      }),
  );
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const details = (await response.text()).slice(0, 1200);
    throw new Error(`${options.method ?? "GET"} ${url} failed (${response.status}): ${details}`);
  }
  return response.json();
}

async function findSite(apiKey, accountId, configuredSiteId) {
  if (configuredSiteId) return { id: configuredSiteId, source: "WIX_SITE_ID" };

  const response = await requestJson(
    "https://www.wixapis.com/site-list/v2/sites/query",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "wix-account-id": accountId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          filter: { name: SITE_NAME },
          cursorPaging: { limit: 10 },
        },
      }),
    },
  );

  const site = response.sites?.find((candidate) => candidate.name === SITE_NAME);
  if (!site) throw new Error(`Could not find the Wix site named ${SITE_NAME}.`);
  return site;
}

function recordsFrom(response, key) {
  return response[key] ?? response.items ?? response.data?.[key] ?? [];
}

function totalFrom(response, fallback) {
  return Number(
    response.metaData?.total ??
      response.metaData?.count ??
      response.pagingMetadata?.total ??
      response.paging?.total ??
      response.totalResults ??
      fallback,
  );
}

async function queryAll(siteHeaders, endpoint, key, fieldsets = []) {
  const pages = [];
  const records = [];
  const limit = 100;
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const body = {
      query: { paging: { limit, offset } },
    };
    if (fieldsets.length) body.fieldsets = fieldsets;

    const response = await requestJson(`${API_ROOT}/${endpoint}/query`, {
      method: "POST",
      headers: { ...siteHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const page = recordsFrom(response, key);
    pages.push({ request: body, response });
    records.push(...page);
    total = totalFrom(response, records.length);
    offset += page.length;
    if (page.length === 0 || page.length < limit) break;
  }

  return { records, pages, total: Number.isFinite(total) ? total : records.length };
}

async function listAll(siteHeaders, endpoint, key) {
  const pages = [];
  const records = [];
  const limit = 100;
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const url = `${API_ROOT}/${endpoint}?paging.limit=${limit}&paging.offset=${offset}`;
    const response = await requestJson(url, { headers: siteHeaders });
    const page = recordsFrom(response, key);
    pages.push({ url, response });
    records.push(...page);
    total = totalFrom(response, records.length);
    offset += page.length;
    if (page.length === 0 || page.length < limit) break;
  }

  return { records, pages, total: Number.isFinite(total) ? total : records.length };
}

async function getPostDetails(siteHeaders, postId) {
  const params = new URLSearchParams();
  for (const fieldset of ["RICH_CONTENT", "CONTENT_TEXT", "URL", "METRICS"]) {
    params.append("fieldsets", fieldset);
  }

  try {
    return await requestJson(`${API_ROOT}/posts/${encodeURIComponent(postId)}?${params}`, {
      headers: siteHeaders,
    });
  } catch (error) {
    // Some Wix accounts return rich content through query only. Keep the query result
    // if an individual detail request is unavailable.
    return { _detailError: error instanceof Error ? error.message : String(error) };
  }
}

function mediaFromString(value) {
  if (typeof value !== "string") return null;

  if (value.startsWith("wix:image://v1/") || value.startsWith("wix:video://v1/") || value.startsWith("wix:file://v1/") || value.startsWith("wix:document://v1/")) {
    const payload = value.slice(value.indexOf("v1/") + 3);
    const separator = payload.indexOf("/");
    const mediaKey = (separator === -1 ? payload : payload.slice(0, separator)).split("#")[0];
    if (!mediaKey) return null;
    return {
      source: value,
      mediaKey,
      sourceUrl: `https://static.wixstatic.com/media/${mediaKey}`,
    };
  }

  if (value.startsWith("media/")) {
    const mediaKey = value.slice("media/".length);
    if (mediaKey) {
      return {
        source: value,
        mediaKey,
        sourceUrl: `https://static.wixstatic.com/media/${mediaKey}`,
      };
    }
  }

  if (value.includes("static.wixstatic.com/media/")) {
    const marker = "static.wixstatic.com/media/";
    const start = value.indexOf(marker) + marker.length;
    const mediaKey = value.slice(start).split(/[?#]/)[0].split("/")[0];
    if (!mediaKey) return null;
    return { source: value, mediaKey, sourceUrl: value };
  }

  if (value.startsWith("https://i.ytimg.com/")) {
    return {
      source: value,
      mediaKey: `external:${value}`,
      sourceUrl: value,
    };
  }

  // Ricos stores some gallery images and video thumbnails as bare Wix media
  // keys rather than full wix:image URIs.
  if (/^[a-z0-9]+_[a-f0-9]{20,}.*\.(?:jpe?g|png|webp|gif)$/i.test(value)) {
    return {
      source: value,
      mediaKey: value,
      sourceUrl: `https://static.wixstatic.com/media/${value}`,
    };
  }

  return null;
}

function collectMedia(value, location = "$", found = new Map()) {
  if (typeof value === "string") {
    const media = mediaFromString(value);
    if (media && !found.has(media.mediaKey)) found.set(media.mediaKey, { ...media, locations: [location] });
    else if (media) found.get(media.mediaKey).locations.push(location);
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectMedia(item, `${location}[${index}]`, found));
    return found;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => collectMedia(child, `${location}.${key}`, found));
  }
  return found;
}

function safeFileName(mediaKey) {
  return mediaKey.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function downloadMedia(media) {
  const localName = safeFileName(media.mediaKey);
  const destination = path.join(MEDIA_DIR, localName);
  if (await fileExists(destination)) return { ...media, localName, status: "existing" };

  const response = await fetch(media.sourceUrl);
  if (!response.ok) {
    return { ...media, localName, status: `failed:${response.status}` };
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  return { ...media, localName, status: "downloaded" };
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const output = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= values.length) return;
      output[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return output;
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  if (!env.WIX_API_KEY || !env.WIX_ACCOUNT_ID) {
    throw new Error("WIX_API_KEY and WIX_ACCOUNT_ID must be set in .env.local.");
  }

  await Promise.all([
    mkdir(RAW_DIR, { recursive: true }),
    mkdir(MEDIA_DIR, { recursive: true }),
    mkdir(path.dirname(NORMALIZED_PATH), { recursive: true }),
  ]);

  const site = await findSite(env.WIX_API_KEY, env.WIX_ACCOUNT_ID, env.WIX_SITE_ID);
  const siteHeaders = {
    Authorization: env.WIX_API_KEY,
    "wix-site-id": site.id,
    Accept: "application/json",
  };

  const postQuery = await queryAll(
    siteHeaders,
    "posts",
    "posts",
    ["RICH_CONTENT", "CONTENT_TEXT", "URL", "METRICS"],
  );
  const details = await mapWithConcurrency(postQuery.records, 4, (post) =>
    getPostDetails(siteHeaders, post.id ?? post._id),
  );
  const posts = postQuery.records.map((post, index) => ({
    ...post,
    _apiDetail: details[index],
  }));

  const categories = await listAll(siteHeaders, "categories", "categories");
  const tags = await queryAll(siteHeaders, "tags", "tags");

  const mediaMap = new Map();
  posts.forEach((post) => collectMedia(post, `post:${post.id ?? post._id}`, mediaMap));
  const media = await mapWithConcurrency([...mediaMap.values()], 6, downloadMedia);

  const exportedAt = new Date().toISOString();
  const raw = {
    source: "Wix Blog REST API",
    site,
    apiRoot: API_ROOT,
    exportedAt,
    publishedPostCount: posts.length,
    posts,
  };
  const normalized = posts.map((post) => ({
    id: post.id ?? post._id,
    title: post.title ?? "",
    slug: post.slug ?? "",
    url: post.url ?? null,
    excerpt: post.excerpt ?? "",
    contentText: post.contentText ?? null,
    richContent: post.richContent ?? null,
    heroImage: post.heroImage ?? null,
    media: post.media ?? null,
    firstPublishedDate: post.firstPublishedDate ?? null,
    lastPublishedDate: post.lastPublishedDate ?? null,
    categoryIds: post.categoryIds ?? [],
    tagIds: post.tagIds ?? [],
    hashtags: post.hashtags ?? [],
    seoData: post.seoData ?? null,
    metrics: post.metrics ?? null,
    memberId: post.memberId ?? null,
    contactId: post.contactId ?? null,
    minutesToRead: post.minutesToRead ?? null,
    featured: post.featured ?? false,
    pinned: post.pinned ?? false,
    relatedPostIds: post.relatedPostIds ?? [],
    rawPost: post,
  }));

  await Promise.all([
    writeFile(path.join(RAW_DIR, "posts.raw.json"), `${JSON.stringify(raw, null, 2)}\n`),
    writeFile(path.join(RAW_DIR, "post-query-pages.raw.json"), `${JSON.stringify({ exportedAt, ...postQuery }, null, 2)}\n`),
    writeFile(path.join(RAW_DIR, "categories.raw.json"), `${JSON.stringify({ exportedAt, ...categories }, null, 2)}\n`),
    writeFile(path.join(RAW_DIR, "tags.raw.json"), `${JSON.stringify({ exportedAt, ...tags }, null, 2)}\n`),
    writeFile(path.join(RAW_DIR, "media-manifest.json"), `${JSON.stringify({ exportedAt, total: media.length, media }, null, 2)}\n`),
    writeFile(NORMALIZED_PATH, `${JSON.stringify({ source: "Wix Blog REST API", exportedAt, posts: normalized }, null, 2)}\n`),
  ]);

  const downloaded = media.filter((item) => item.status === "downloaded").length;
  const existing = media.filter((item) => item.status === "existing").length;
  const failed = media.filter((item) => item.status.startsWith("failed:")).length;
  console.log(`Wix site: ${site.displayName ?? site.name} (${site.id})`);
  console.log(`Published posts exported: ${posts.length}/${postQuery.total}`);
  console.log(`Categories exported: ${categories.records.length}`);
  console.log(`Tags exported: ${tags.records.length}`);
  console.log(`Media references found: ${media.length}`);
  console.log(`Media downloaded: ${downloaded}; already local: ${existing}; failed: ${failed}`);
  console.log(`Raw export: ${path.relative(ROOT, RAW_DIR)}`);
  console.log(`Normalized data: ${path.relative(ROOT, NORMALIZED_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
