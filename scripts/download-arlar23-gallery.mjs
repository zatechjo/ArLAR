import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "data", "arlar23-gallery-manifest.json");
const OUTPUT_PATH = path.join(ROOT, "data", "arlar23-gallery-download-manifest.json");

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function downloadAsset(asset) {
  const destination = path.join(ROOT, asset.localPath);
  await mkdir(path.dirname(destination), { recursive: true });
  if (await fileExists(destination)) {
    const existing = await readFile(destination);
    if (existing.length > 0) {
      return { ...asset, status: "existing", bytes: existing.length, sha256: createHash("sha256").update(existing).digest("hex") };
    }
  }

  let lastError = "unknown error";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(asset.sourceUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error("empty response");
      await writeFile(destination, bytes);
      return { ...asset, status: "downloaded", bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  return { ...asset, status: `failed:${lastError}`, bytes: 0 };
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

const manifest = JSON.parse(await readFile(INPUT_PATH, "utf8"));
if (!Array.isArray(manifest.assets) || manifest.assets.length !== 100) {
  throw new Error(`Expected 100 gallery assets, found ${manifest.assets?.length ?? 0}.`);
}

const assets = await mapWithConcurrency(manifest.assets, 8, downloadAsset);
const output = {
  ...manifest,
  downloadedAt: new Date().toISOString(),
  assets,
  counts: {
    total: assets.length,
    downloaded: assets.filter((asset) => asset.status === "downloaded").length,
    existing: assets.filter((asset) => asset.status === "existing").length,
    failed: assets.filter((asset) => asset.status.startsWith("failed:")).length,
  },
};
await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Gallery assets: ${assets.length}`);
console.log(`Downloaded: ${output.counts.downloaded}; existing: ${output.counts.existing}; failed: ${output.counts.failed}`);
console.log(`Manifest: ${path.relative(ROOT, OUTPUT_PATH)}`);
