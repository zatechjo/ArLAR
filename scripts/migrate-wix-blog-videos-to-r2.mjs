import { readFileSync, writeFileSync } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const root = process.cwd();
const sourcePath = path.join(root, "src", "data", "blog-posts.json");
const manifestPath = path.join(root, "data", "wix", "blog", "video-r2-manifest.json");
const env = loadEnv(path.join(root, ".env.local"));
const apply = process.argv.includes("--apply");
const accountId = required("CLOUDFLARE_ACCOUNT_ID");
const bucket = required("CLOUDFLARE_R2_BUCKET");
const accessKeyId = required("CLOUDFLARE_R2_ACCESS_KEY_ID");
const secretAccessKey = required("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
const publicBaseUrl = required("CLOUDFLARE_R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
const client = new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const source = readFileSync(sourcePath, "utf8");
const urls = [...new Set(source.match(/https:\/\/video\.wixstatic\.com\/video\/[^"']+/g) || [])];
const sourcesById = new Map();
for (const url of urls) {
  if (url.includes("/storyboard/")) continue;
  const id = videoId(url);
  if (!id) continue;
  const current = sourcesById.get(id);
  if (!current || quality(url) > quality(current)) sourcesById.set(id, url);
}

console.log(`Found ${sourcesById.size} unique Wix blog video(s).`);
if (!apply) {
  for (const [id, url] of sourcesById) console.log(`${id}: ${url}`);
  console.log("Dry run only. Add --apply to upload.");
  process.exit(0);
}

const videos = [];
const failures = [];
let totalBytes = 0;
for (const [index, [id, sourceUrl]] of [...sourcesById].entries()) {
  const key = `videos/wix-blog/${id}.mp4`;
  try {
    let contentLength = await existingSize(key);
    let resolvedSourceUrl = sourceUrl;
    if (contentLength === null) {
      const downloaded = await downloadVideo(sourceUrl);
      resolvedSourceUrl = downloaded.url;
      const response = downloaded.response;
      contentLength = Number(response.headers.get("content-length") || 0) || undefined;
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Readable.fromWeb(response.body),
        ContentType: "video/mp4",
        ...(contentLength ? { ContentLength: contentLength } : {}),
        CacheControl: "public, max-age=31536000, immutable",
      }));
    }
    totalBytes += contentLength || 0;
    const publicUrl = `${publicBaseUrl}/${key}`;
    videos.push({ id, sourceUrl: resolvedSourceUrl, key, publicUrl, bytes: contentLength || null, status: "ready" });
    console.log(`${index + 1}/${sourcesById.size} ready ${key}${contentLength ? ` (${formatBytes(contentLength)})` : ""}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ id, sourceUrl, message });
    videos.push({ id, sourceUrl, key, publicUrl: null, bytes: null, status: "unavailable" });
    console.warn(`${index + 1}/${sourcesById.size} unavailable ${id}: ${message}`);
  }
}

writeFileSync(manifestPath, `${JSON.stringify({ migratedAt: new Date().toISOString(), total: videos.length, ready: videos.length - failures.length, unavailable: failures.length, videos }, null, 2)}\n`);
console.log(`Migration complete: ${videos.length - failures.length} ready, ${failures.length} unavailable, ${formatBytes(totalBytes)} known bytes.`);

function videoId(url) { return new URL(url).pathname.split("/").filter(Boolean)[1] || ""; }
function quality(url) { const match = url.match(/\/(\d+)p\/mp4\//); return match ? Number(match[1]) : url.endsWith("/file") ? 1 : 0; }
async function existingSize(key) { try { const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key })); return result.ContentLength || 0; } catch (error) { if (error?.$metadata?.httpStatusCode === 404) return null; throw error; } }
async function downloadVideo(sourceUrl) {
  const base = sourceUrl.replace(/\/(?:\d+p\/mp4\/file\.mp4|file)$/, "");
  const candidates = [...new Set([sourceUrl, `${base}/720p/mp4/file.mp4`, `${base}/480p/mp4/file.mp4`, `${base}/360p/mp4/file.mp4`, `${base}/file`])];
  let lastStatus = 0;
  for (const url of candidates) { const response = await fetch(url, { redirect: "follow" }); if (response.ok && response.body) return { response, url }; lastStatus = response.status; }
  throw new Error(`All download variants failed (last status ${lastStatus}) for ${sourceUrl}`);
}
function formatBytes(bytes) { return bytes >= 1024 * 1024 * 1024 ? `${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB` : `${(bytes / 1024 / 1024).toFixed(2)}MB`; }
function loadEnv(filePath) { const values = {}; for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) { const match = line.match(/^\s*([^#=]+)\s*=\s*(.*?)\s*$/); if (match) values[match[1].trim()] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2"); } return values; }
function required(name) { const value = env[name]?.trim(); if (!value) throw new Error(`${name} is missing from .env.local.`); return value; }
