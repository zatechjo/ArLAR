import { createReadStream, readdirSync, statSync, readFileSync } from "node:fs";
import path from "node:path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const env = loadEnv(path.join(root, ".env.local"));
const accountId = required("CLOUDFLARE_ACCOUNT_ID");
const bucket = required("CLOUDFLARE_R2_BUCKET");
const accessKeyId = required("CLOUDFLARE_R2_ACCESS_KEY_ID");
const secretAccessKey = required("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
const publicBaseUrl = required("CLOUDFLARE_R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
const requestedPrefix = process.argv.find((argument) => argument.startsWith("--prefix="))?.slice("--prefix=".length).replaceAll("\\", "/").replace(/^\/+|\/+$/g, "") || "";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const files = walk(publicRoot)
  .filter(({ extension }) => ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(extension))
  .filter(({ key }) => !requestedPrefix || key === requestedPrefix || key.startsWith(`${requestedPrefix}/`))
  .sort((left, right) => left.key.localeCompare(right.key));

console.log(`Preparing ${files.length} image files for R2 migration${requestedPrefix ? ` under ${requestedPrefix}` : ""}.`);
const concurrency = 8;
let cursor = 0;
let completed = 0;
let uploaded = 0;
let skipped = 0;
const failures = [];

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= files.length) return;
    const file = files[index];
    try {
      if (await exists(file.key)) {
        skipped += 1;
      } else {
        await retry(() => upload(file));
        uploaded += 1;
      }
    } catch (error) {
      failures.push({ key: file.key, message: error instanceof Error ? error.message : String(error) });
    } finally {
      completed += 1;
      if (completed % 25 === 0 || completed === files.length) console.log(`${completed}/${files.length} processed (uploaded ${uploaded}, already present ${skipped}, failed ${failures.length})`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, () => worker()));

if (failures.length) {
  console.error(`Migration finished with ${failures.length} failed file(s).`);
  for (const failure of failures.slice(0, 20)) console.error(`${failure.key}: ${failure.message}`);
  process.exitCode = 1;
} else {
  console.log(`Migration complete: ${uploaded} uploaded, ${skipped} already present.`);
}
console.log(`R2 base URL: ${publicBaseUrl}`);

async function exists(key) {
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

async function upload(file) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: file.key,
    Body: createReadStream(file.absolutePath),
    ContentType: contentType(file.extension),
    ContentLength: file.size,
    CacheControl: "public, max-age=31536000, immutable",
  }));
}

async function retry(operation) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

function walk(directory) {
  const results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(absolutePath));
      continue;
    }
    const extension = path.extname(entry.name).slice(1).toLowerCase();
    const relativePath = path.relative(publicRoot, absolutePath).replaceAll("\\", "/");
    results.push({ absolutePath, key: relativePath, extension, size: statSync(absolutePath).size });
  }
  return results;
}

function contentType(extension) {
  if (extension === "svg") return "image/svg+xml";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return `image/${extension}`;
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
