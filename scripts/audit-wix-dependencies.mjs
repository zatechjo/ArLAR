import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const roots = ["src", "data"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css"]);
const matches = new Map();
const summaryOnly = process.argv.includes("--summary");
const runtimeVideosOnly = process.argv.includes("--runtime-videos");

for (const root of roots) {
  for (const file of walk(path.resolve(root))) {
    if (!extensions.has(path.extname(file))) continue;
    const source = readFileSync(file, "utf8");
    const pattern = /https:\/\/(?:static|video)\.wixstatic\.com\/[^"'<>\s)]+/g;
    for (const match of source.matchAll(pattern)) {
      const url = match[0].replace(/[.,;]+$/, "");
      const files = matches.get(url) || new Set();
      files.add(path.relative(process.cwd(), file).replaceAll("\\", "/"));
      matches.set(url, files);
    }
  }
}

const records = [...matches].map(([url, files]) => ({
  url,
  host: new URL(url).hostname,
  files: [...files],
}));
const runtimeRecords = records.filter((record) => record.files.some((file) => file.startsWith("src/")));
const runtimeAssetIds = new Set(runtimeRecords.map((record) => assetId(record.url)).filter(Boolean));

const report = {
  total: records.length,
  images: records.filter((record) => record.host === "static.wixstatic.com").length,
  videos: records.filter((record) => record.host === "video.wixstatic.com").length,
  files: [...new Set(records.flatMap((record) => record.files))].sort(),
  runtimeUrls: runtimeRecords.length,
  runtimeAssets: runtimeAssetIds.size,
  runtimeVideoAssets: [...runtimeAssetIds].filter((id) => id.startsWith("video:")).length,
  ...(summaryOnly ? {} : { records }),
};

console.log(JSON.stringify(runtimeVideosOnly
  ? runtimeRecords.filter((record) => record.host === "video.wixstatic.com" && !record.url.includes("${"))
  : report, null, 2));

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else files.push(target);
  }
  return files;
}

function assetId(url) {
  if (url.includes("${")) return null;
  const parsed = new URL(url);
  if (parsed.hostname === "static.wixstatic.com") {
    return `image:${parsed.pathname.split("/media/")[1]?.split("/")[0] || ""}`;
  }
  const parts = parsed.pathname.split("/").filter(Boolean);
  return `video:${parts[1] || ""}`;
}
