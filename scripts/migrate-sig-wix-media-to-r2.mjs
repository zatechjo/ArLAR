import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const root = process.cwd();
const sourcePath = path.join(root, "src", "data", "sig-profiles.ts");
const env = loadEnv(path.join(root, ".env.local"));
const apply = process.argv.includes("--apply");
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

let source = readFileSync(sourcePath, "utf8");
const urls = [...new Set(source.match(/https:\/\/(?:static|video)\.wixstatic\.com\/[^"']+/g) || [])];
console.log(`Found ${urls.length} Wix-hosted SIG media asset(s).`);

if (!apply) {
  for (const url of urls) console.log(url);
  console.log("Dry run only. Add --apply to upload and rewrite.");
  process.exit(0);
}

for (const [index, url] of urls.entries()) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
  const body = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type")?.split(";")[0] || "application/octet-stream";
  const key = objectKey(url, contentType);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ContentLength: body.length,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  const replacement = `${publicBaseUrl}/${key}`;
  source = source.replaceAll(url, replacement);
  console.log(`${index + 1}/${urls.length} uploaded ${key} (${formatBytes(body.length)})`);
}

writeFileSync(sourcePath, source);
console.log(`Rewrote ${urls.length} URL(s) in ${path.relative(root, sourcePath)}.`);

function objectKey(url, contentType) {
  const parsed = new URL(url);
  if (parsed.hostname === "video.wixstatic.com") {
    const id = parsed.pathname.split("/").filter(Boolean)[1] || "video";
    return `videos/wix-sig/${id}.${extensionFor(contentType, "mp4")}`;
  }
  const id = parsed.pathname.split("/media/")[1]?.split("/")[0] || "image";
  const base = id.replace(/~mv\d+(?=\.|$)/, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  const withoutExtension = base.replace(/\.[^.]+$/, "");
  return `images/wix-sig/${withoutExtension}.${extensionFor(contentType, path.extname(base).slice(1) || "jpg")}`;
}

function extensionFor(contentType, fallback) {
  return ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4" })[contentType] || fallback;
}

function formatBytes(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)}MB` : `${(bytes / 1024).toFixed(1)}KB`;
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
