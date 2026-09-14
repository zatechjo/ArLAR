import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import manifest from "../src/data/arlar23-gallery.json" with { type: "json" };

const root = process.cwd();
const concurrency = 4;
let cursor = 0;
let completed = 0;
let generated = 0;
let skipped = 0;

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= manifest.entries.length) return;
    const asset = manifest.entries[index];
    const input = path.join(root, "public", decodeURIComponent(asset.localSrc).replace(/^\//, ""));
    const relativeOutput = asset.thumbnailLocalSrc
      ? decodeURIComponent(asset.thumbnailLocalSrc).replace(/^\//, "")
      : `images/arlar23/gallery-thumbnails/Day ${asset.day}/${path.parse(asset.filename).name}.webp`;
    const output = path.join(root, "public", relativeOutput);

    await mkdir(path.dirname(output), { recursive: true });
    const [inputStat, outputStat] = await Promise.all([
      stat(input),
      stat(output).catch(() => null),
    ]);

    if (outputStat && outputStat.mtimeMs >= inputStat.mtimeMs) {
      skipped += 1;
    } else {
      await sharp(input, { limitInputPixels: false })
        .autoOrient()
        .resize({ width: 960, withoutEnlargement: true })
        .webp({ quality: 74, effort: 4, smartSubsample: true })
        .toFile(output);
      generated += 1;
    }

    completed += 1;
    if (completed % 25 === 0 || completed === manifest.entries.length) {
      console.log(`${completed}/${manifest.entries.length} processed (${generated} generated, ${skipped} current)`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
console.log(`Thumbnail build complete: ${generated} generated, ${skipped} already current.`);
