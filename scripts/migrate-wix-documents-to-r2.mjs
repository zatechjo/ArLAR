import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const env = loadEnv(path.join(root, ".env.local"));
const documentExtensions = "pdf|doc|docx|xls|xlsx|ppt|pptx|zip";
const documentIdPattern = new RegExp(
  `[A-Za-z0-9]+_[A-Fa-f0-9]{20,}\\.(?:${documentExtensions})`,
  "gi",
);
const urlPattern = /https?:\/\/[^\s"'<>\\]+/gi;
const sourceFiles = ["src", "data"]
  .flatMap((directory) => walk(path.join(root, directory)))
  .filter((filePath) => /\.(?:json|ts|tsx|js|mjs)$/i.test(filePath));
const documents = new Map();

for (const filePath of sourceFiles) {
  const contents = readFileSync(filePath, "utf8");
  for (const match of contents.matchAll(documentIdPattern)) {
    const id = match[0];
    const key = id.toLowerCase();
    const document = documents.get(key) || { id, sourceUrls: new Set(), files: new Set() };
    document.files.add(filePath);
    documents.set(key, document);
  }
  for (const rawUrl of contents.match(urlPattern) || []) {
    const url = rawUrl.replace(/[),.;]+$/, "");
    const id = url.match(documentIdPattern)?.[0];
    if (!id || !isOldWixDocumentUrl(url)) continue;
    const key = id.toLowerCase();
    const document = documents.get(key) || { id, sourceUrls: new Set(), files: new Set() };
    document.sourceUrls.add(url);
    document.files.add(filePath);
    documents.set(key, document);
  }
}

const inventory = [...documents.values()].sort((left, right) =>
  left.id.localeCompare(right.id),
);

console.log(`Found ${inventory.length} unique Wix document IDs.`);
for (const document of inventory) {
  console.log(`${document.id} (${document.files.size} source file${document.files.size === 1 ? "" : "s"})`);
}

if (!apply) {
  console.log("Inventory only. Run with --apply to download, upload, and rewrite links.");
  process.exit(0);
}

const accountId = required("CLOUDFLARE_ACCOUNT_ID");
const bucket = required("CLOUDFLARE_R2_BUCKET");
const accessKeyId = required("CLOUDFLARE_R2_ACCESS_KEY_ID");
const secretAccessKey = required("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
const publicBaseUrl = required("CLOUDFLARE_R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});
const migrated = new Map();

for (const [index, document] of inventory.entries()) {
  const objectKey = `documents/wix/${document.id}`;
  const publicUrl = `${publicBaseUrl}/${objectKey}`;
  process.stdout.write(`[${index + 1}/${inventory.length}] ${document.id}: `);

  if (await objectExists(objectKey)) {
    migrated.set(document.id.toLowerCase(), { ...document, objectKey, publicUrl, status: "existing" });
    console.log("already in R2");
    continue;
  }

  const downloaded = await downloadDocument(document);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: downloaded.body,
      ContentLength: downloaded.body.byteLength,
      ContentType: contentType(document.id, downloaded.contentType),
      ContentDisposition: `inline; filename="${document.id}"`,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  migrated.set(document.id.toLowerCase(), { ...document, objectKey, publicUrl, status: "uploaded" });
  console.log(`uploaded ${(downloaded.body.byteLength / 1024 / 1024).toFixed(2)} MB`);
}

let rewrittenFiles = 0;
let rewrittenLinks = 0;
for (const filePath of sourceFiles) {
  const original = readFileSync(filePath, "utf8");
  let replacements = 0;
  const updated = original.replace(urlPattern, (rawUrl) => {
    const suffix = rawUrl.match(/[),.;]+$/)?.[0] || "";
    const url = suffix ? rawUrl.slice(0, -suffix.length) : rawUrl;
    if (!isOldWixDocumentUrl(url)) return rawUrl;
    const id = url.match(documentIdPattern)?.[0];
    const migration = id ? migrated.get(id.toLowerCase()) : undefined;
    if (!migration) return rawUrl;
    replacements += 1;
    return `${migration.publicUrl}${suffix}`;
  });
  if (updated === original) continue;
  writeFileSync(filePath, updated, "utf8");
  rewrittenFiles += 1;
  rewrittenLinks += replacements;
}

const manifestPath = path.join(root, "data", "wix", "documents-r2-manifest.json");
writeFileSync(
  manifestPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    bucket,
    publicBaseUrl,
    documents: [...migrated.values()].map(({ id, objectKey, publicUrl, status, sourceUrls }) => ({
      id,
      objectKey,
      publicUrl,
      status,
      sourceUrls: [...sourceUrls],
    })),
  }, null, 2)}\n`,
  "utf8",
);

console.log(`Migration complete: ${migrated.size} documents available in R2.`);
console.log(`Rewrote ${rewrittenLinks} old Wix links across ${rewrittenFiles} files.`);
console.log(`Manifest: ${path.relative(root, manifestPath)}`);

async function objectExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    const status = error && typeof error === "object" && "$metadata" in error
      ? error.$metadata?.httpStatusCode
      : undefined;
    if (status === 404) return false;
    throw error;
  }
}

async function downloadDocument(document) {
  const candidates = [
    ...document.sourceUrls,
    `https://www.arabrheumatology.org/_files/ugd/${document.id}`,
    `https://8e338f2e-635d-4e06-8ebf-31089162dfcf.filesusr.com/ugd/${document.id}`,
  ];
  const failures = [];

  for (const url of [...new Set(candidates)]) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = Buffer.from(await response.arrayBuffer());
      if (!body.byteLength) throw new Error("empty response");
      const responseType = response.headers.get("content-type") || "";
      if (responseType.includes("text/html")) throw new Error("received HTML instead of a document");
      return { body, contentType: responseType };
    } catch (error) {
      failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Could not download ${document.id}. ${failures.join(" | ")}`);
}

function isOldWixDocumentUrl(value) {
  try {
    const url = new URL(value);
    return (
      (url.hostname.endsWith("filesusr.com") && url.pathname.includes("/ugd/")) ||
      (url.hostname.replace(/^www\./, "") === "arabrheumatology.org" &&
        url.pathname.includes("/_files/ugd/"))
    );
  } catch {
    return false;
  }
}

function contentType(fileName, responseType) {
  if (responseType && !responseType.includes("octet-stream")) return responseType.split(";")[0];
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".doc") return "application/msword";
  if (extension === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (extension === ".xls") return "application/vnd.ms-excel";
  if (extension === ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (extension === ".ppt") return "application/vnd.ms-powerpoint";
  if (extension === ".pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (extension === ".zip") return "application/zip";
  return "application/octet-stream";
}

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolutePath));
    else if (entry.isFile() && statSync(absolutePath).size <= 25 * 1024 * 1024) files.push(absolutePath);
  }
  return files;
}

function loadEnv(filePath) {
  const values = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*?)\s*$/);
    if (match) values[match[1].trim()] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  return values;
}

function required(name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is missing from .env.local.`);
  return value;
}
