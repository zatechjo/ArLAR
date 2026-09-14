import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const COLLECTION_ID = "ArLARCollegeVideos";
const SITE_NAME = "arlaractual";
const RAW_DIR = path.join(ROOT, "data", "wix", "arlar-college");
const DATA_PATH = path.join(ROOT, "src", "data", "college-events.json");
const IMAGE_DIR = path.join(
  ROOT,
  "public",
  "images",
  "arlar-college-events",
);
const ORIGINAL_IMAGE_DIR = path.join(IMAGE_DIR, "originals");

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
          .replace(/^(['"])(.*)\1$/, "$2");
        return [key, value];
      }),
  );
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const details = (await response.text()).slice(0, 800);
    throw new Error(`${options.method ?? "GET"} ${url} failed (${response.status}): ${details}`);
  }
  return response.json();
}

function getDate(value) {
  if (!value) return null;
  return typeof value === "string" ? value : value.$date ?? null;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function parseWixImage(uri) {
  if (typeof uri !== "string" || !uri.startsWith("wix:image://v1/")) {
    return null;
  }

  const value = uri.slice("wix:image://v1/".length);
  const slash = value.indexOf("/");
  const mediaKey = slash === -1 ? value.split("#")[0] : value.slice(0, slash);
  const encodedName = slash === -1 ? "" : value.slice(slash + 1).split("#")[0];
  let originalName = encodedName;

  try {
    originalName = decodeURIComponent(encodedName);
  } catch {
    // Preserve Wix's encoded value if it cannot be decoded safely.
  }

  return {
    mediaKey,
    originalName,
    sourceUrl: `https://static.wixstatic.com/media/${mediaKey}`,
  };
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function downloadFile(url, destination) {
  if (await fileExists(destination)) return "existing";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image download failed (${response.status}): ${url}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);
  return "downloaded";
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
  if (!site) {
    throw new Error(`Could not find the Wix site named ${SITE_NAME}.`);
  }
  return site;
}

async function getCollection(siteHeaders) {
  const response = await requestJson(
    `https://www.wixapis.com/wix-data/v2/collections/${COLLECTION_ID}?consistentRead=true`,
    { headers: siteHeaders },
  );
  return response.collection;
}

async function getAllItems(siteHeaders, maxPageSize = 1000) {
  const items = [];
  const limit = Math.min(maxPageSize || 1000, 1000);
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const response = await requestJson(
      "https://www.wixapis.com/wix-data/v2/items/query",
      {
        method: "POST",
        headers: {
          ...siteHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataCollectionId: COLLECTION_ID,
          consistentRead: true,
          returnTotalCount: true,
          query: { paging: { limit, offset } },
        }),
      },
    );

    const page = response.dataItems ?? [];
    items.push(...page);
    total = response.pagingMetadata?.total ?? items.length;
    offset += page.length;

    if (page.length === 0) break;
  }

  return { items, total };
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const apiKey = env.WIX_API_KEY;
  const accountId = env.WIX_ACCOUNT_ID;

  if (!apiKey || !accountId) {
    throw new Error("WIX_API_KEY and WIX_ACCOUNT_ID must be set in .env.local.");
  }

  await Promise.all([
    mkdir(RAW_DIR, { recursive: true }),
    mkdir(ORIGINAL_IMAGE_DIR, { recursive: true }),
  ]);

  const site = await findSite(apiKey, accountId, env.WIX_SITE_ID);
  const siteHeaders = {
    Authorization: apiKey,
    "wix-site-id": site.id,
    Accept: "application/json",
  };
  const collection = await getCollection(siteHeaders);
  const { items, total } = await getAllItems(
    siteHeaders,
    collection.maxPageSize,
  );

  if (items.length !== total) {
    throw new Error(`Incomplete export: received ${items.length} of ${total} items.`);
  }

  const existing = JSON.parse(await readFile(DATA_PATH, "utf8"));
  const existingImages = new Map(
    (existing.events ?? []).map((event) => [event.mediaKey, event.image]),
  );
  const usedNames = new Set();
  const manifest = [];
  let downloaded = 0;
  let alreadyLocal = 0;

  const events = [];
  for (const item of items) {
    const data = item.data ?? {};
    const wixImage = parseWixImage(data.image);
    const date = getDate(data.date);
    const createdDate = getDate(data._createdDate ?? item.createdDate);
    const updatedDate = getDate(data._updatedDate ?? item.updatedDate);
    const datePrefix = date?.slice(0, 10) ?? "undated";
    const extension = wixImage
      ? path.extname(wixImage.mediaKey).toLowerCase() || ".jpg"
      : "";
    const fallbackName = `${datePrefix}-${slugify(data.webinarTitle || data._id || item.id)}${extension}`;
    let localName = wixImage
      ? existingImages.get(wixImage.mediaKey) || fallbackName
      : null;

    if (localName && usedNames.has(localName)) {
      const parsed = path.parse(localName);
      localName = `${parsed.name}-${String(data._id ?? item.id).slice(0, 8)}${parsed.ext}`;
    }
    if (localName) usedNames.add(localName);

    let originalLocalName = null;
    if (wixImage) {
      originalLocalName = wixImage.mediaKey;
      const status = await downloadFile(
        wixImage.sourceUrl,
        path.join(ORIGINAL_IMAGE_DIR, originalLocalName),
      );
      if (status === "downloaded") downloaded += 1;
      else alreadyLocal += 1;

      manifest.push({
        wixId: data._id ?? item.id,
        field: "image",
        wixUri: data.image,
        mediaKey: wixImage.mediaKey,
        originalFileName: wixImage.originalName,
        localOriginal: `public/images/arlar-college-events/originals/${originalLocalName}`,
        localWebImage: localName
          ? `public/images/arlar-college-events/${localName}`
          : null,
      });
    }

    events.push({
      id: String(data._id ?? item.id).slice(0, 8),
      wixId: data._id ?? item.id,
      title: data.webinarTitle ?? "",
      date,
      year: data.year ?? (date ? Number(date.slice(0, 4)) : null),
      groups: Array.isArray(data.sig) ? data.sig : [],
      speakers: data.speakers ?? null,
      webinarUrl: data.viewWebinar ?? null,
      image: localName,
      originalImage: originalLocalName,
      mediaKey: wixImage?.mediaKey ?? null,
      wixImage: data.image ?? null,
      ownerId: data._owner ?? null,
      createdDate,
      updatedDate,
    });
  }

  events.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const exportedAt = new Date().toISOString();
  await Promise.all([
    writeFile(
      path.join(RAW_DIR, "collection.json"),
      `${JSON.stringify(collection, null, 2)}\n`,
    ),
    writeFile(
      path.join(RAW_DIR, "items.raw.json"),
      `${JSON.stringify({ exportedAt, site, collectionId: COLLECTION_ID, total, items }, null, 2)}\n`,
    ),
    writeFile(
      path.join(RAW_DIR, "media-manifest.json"),
      `${JSON.stringify({ exportedAt, total: manifest.length, media: manifest }, null, 2)}\n`,
    ),
    writeFile(
      DATA_PATH,
      `${JSON.stringify({ source: "Wix CMS API", collection: COLLECTION_ID, exportedAt, events }, null, 2)}\n`,
    ),
  ]);

  const withSpeakers = events.filter((event) => event.speakers).length;
  console.log(`Wix site: ${site.displayName ?? site.name} (${site.id})`);
  console.log(`Collection: ${collection.displayName} (${collection.id})`);
  console.log(`Records exported: ${events.length}/${total}`);
  console.log(`Records with speakers: ${withSpeakers}`);
  console.log(`Original covers downloaded: ${downloaded}`);
  console.log(`Original covers already local: ${alreadyLocal}`);
  console.log(`Raw export: ${path.relative(ROOT, RAW_DIR)}`);
  console.log(`Normalized data: ${path.relative(ROOT, DATA_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
