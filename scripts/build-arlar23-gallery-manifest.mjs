import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "public", "images", "arlar23", "gallery");
const outputPath = path.join(root, "src", "data", "arlar23-gallery.json");
const imageExtensions = new Set([".jpg", ".jpeg"]);
const days = [1, 2, 3, 4];

function compareFiles(a, b) {
  return a.mtimeMs - b.mtimeMs || a.birthtimeMs - b.birthtimeMs || a.name.localeCompare(b.name, "en", { numeric: true, sensitivity: "base" });
}

const entries = [];
const counts = {};

for (const day of days) {
  const directory = path.join(sourceRoot, `Day ${day}`);
  const names = await readdir(directory);
  const files = [];
  for (const name of names) {
    if (!imageExtensions.has(path.extname(name).toLowerCase())) continue;
    const filePath = path.join(directory, name);
    const details = await stat(filePath);
    if (!details.isFile()) continue;
    files.push({ name, mtimeMs: details.mtimeMs, birthtimeMs: details.birthtimeMs });
  }
  files.sort(compareFiles);
  counts[day] = files.length;
  for (const [index, file] of files.entries()) {
    const folder = `Day ${day}`;
    entries.push({
      day,
      order: index + 1,
      filename: file.name,
      localSrc: `/images/arlar23/gallery/${encodeURIComponent(folder)}/${encodeURIComponent(file.name)}`,
      // The migration preserves the public-folder path in R2, so point the
      // production manifest at that existing object instead of duplicating
      // the nearly 4 GB gallery under a second key scheme.
      cloudflareKey: `images/arlar23/gallery/${encodeURIComponent(folder)}/${encodeURIComponent(file.name)}`,
      thumbnailLocalSrc: `/images/arlar23/gallery-thumbnails/${encodeURIComponent(folder)}/${encodeURIComponent(`${path.parse(file.name).name}.webp`)}`,
      thumbnailCloudflareKey: `images/arlar23/gallery-thumbnails/${encodeURIComponent(folder)}/${encodeURIComponent(`${path.parse(file.name).name}.webp`)}`,
    });
  }
}

const manifest = {
  source: "https://www.arabrheumatology.org/arlar23-replay",
  ordering: "Ascending local download timestamp within each Day folder; this preserves the Wix gallery order.",
  counts,
  total: entries.length,
  entries,
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${entries.length} ArLAR23 gallery images to ${path.relative(root, outputPath)}.`);
console.log(Object.entries(counts).map(([day, count]) => `Day ${day}: ${count}`).join(" · "));
