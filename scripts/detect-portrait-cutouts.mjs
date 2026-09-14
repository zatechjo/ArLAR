/**
 * Classifies portrait images as "cutout" (subject on a transparent background)
 * or "photo" (opaque, fills its frame).
 *
 * File extension is NOT a reliable signal: most PNG portraits in this repo are
 * ordinary opaque photographs that happen to have an unused alpha channel, and
 * a couple of them sit on very dark backgrounds. Placing those on a white plate
 * looks worse than cropping them. So we decode the alpha channel and only treat
 * an image as a cutout when it is genuinely see-through.
 *
 * Output: src/data/portrait-cutouts.json (array of public paths).
 * Run with: npm run detect:cutouts
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, posix, relative, resolve } from "node:path";
import { inflateSync } from "node:zlib";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const IMAGE_ROOT = join(PROJECT_ROOT, "public", "images");
const MANIFEST_PATH = join(PROJECT_ROOT, "src", "data", "portrait-cutouts.json");

/**
 * Only people photos. Logos and sponsor strips are legitimately transparent and
 * are never rendered through the portrait frame, so scanning them would only
 * add noise to the manifest.
 */
const PORTRAIT_DIRECTORIES = [
  "aaaa-group/members",
  "board",
  "college-members",
  "media-group",
  "scientific-committee",
];

/** A cutout has real holes in it, not just a few soft anti-aliased edge pixels. */
const TRANSPARENT_ALPHA = 16;
const MIN_TRANSPARENT_RATIO = 0.06;
/** Cutouts are transparent at the frame edge; photos never are. */
const MIN_TRANSPARENT_BORDER_RATIO = 0.5;
const SAMPLE_STEPS = 96;

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readChunks(buffer) {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return null;

  let offset = 8;
  let header = null;
  const data = [];

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      header = {
        width: buffer.readUInt32BE(offset + 8),
        height: buffer.readUInt32BE(offset + 12),
        bitDepth: body[8],
        colorType: body[9],
        interlace: body[12],
      };
    } else if (type === "IDAT") {
      data.push(body);
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  return header ? { header, data: Buffer.concat(data) } : null;
}

/** Reverses the per-scanline PNG filters into raw samples. */
function unfilter(raw, height, stride, bytesPerPixel) {
  const out = Buffer.alloc(height * stride);
  let position = 0;

  for (let y = 0; y < height; y += 1) {
    const filterType = raw[position];
    position += 1;
    const line = raw.subarray(position, position + stride);
    position += stride;

    const rowStart = y * stride;
    const previousStart = rowStart - stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? out[rowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? out[previousStart + x] : 0;
      const upLeft =
        y > 0 && x >= bytesPerPixel ? out[previousStart + x - bytesPerPixel] : 0;

      let value = line[x];
      if (filterType === 1) {
        value += left;
      } else if (filterType === 2) {
        value += up;
      } else if (filterType === 3) {
        value += (left + up) >> 1;
      } else if (filterType === 4) {
        const estimate = left + up - upLeft;
        const distLeft = Math.abs(estimate - left);
        const distUp = Math.abs(estimate - up);
        const distUpLeft = Math.abs(estimate - upLeft);
        value +=
          distLeft <= distUp && distLeft <= distUpLeft
            ? left
            : distUp <= distUpLeft
              ? up
              : upLeft;
      }

      out[rowStart + x] = value & 0xff;
    }
  }

  return out;
}

/**
 * @returns {{ transparentRatio: number, borderTransparentRatio: number } | null}
 *   null when the image has no alpha channel or uses an encoding we do not decode.
 */
function measureTransparency(file) {
  const parsed = readChunks(readFileSync(file));
  if (!parsed) return null;

  const { header, data } = parsed;
  const { width, height, bitDepth, colorType, interlace } = header;

  // colorType 4 = grey+alpha, 6 = RGB+alpha. Anything else carries no alpha.
  const channels = colorType === 6 ? 4 : colorType === 4 ? 2 : 0;
  if (!channels || interlace !== 0 || (bitDepth !== 8 && bitDepth !== 16)) {
    return null;
  }

  const sampleBytes = bitDepth / 8;
  const bytesPerPixel = channels * sampleBytes;
  const stride = width * bytesPerPixel;
  const pixels = unfilter(inflateSync(data), height, stride, bytesPerPixel);

  // Alpha is the last sample of each pixel; for 16-bit we read the high byte,
  // which is all the precision this threshold needs.
  const alphaOffset = bytesPerPixel - sampleBytes;
  const alphaAt = (x, y) => pixels[y * stride + x * bytesPerPixel + alphaOffset];

  const stepX = Math.max(1, Math.floor(width / SAMPLE_STEPS));
  const stepY = Math.max(1, Math.floor(height / SAMPLE_STEPS));

  let transparent = 0;
  let total = 0;
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      total += 1;
      if (alphaAt(x, y) < TRANSPARENT_ALPHA) transparent += 1;
    }
  }

  let borderTransparent = 0;
  let borderTotal = 0;
  const countBorder = (x, y) => {
    borderTotal += 1;
    if (alphaAt(x, y) < TRANSPARENT_ALPHA) borderTransparent += 1;
  };
  for (let x = 0; x < width; x += stepX) {
    countBorder(x, 0);
    countBorder(x, height - 1);
  }
  for (let y = 0; y < height; y += stepY) {
    countBorder(0, y);
    countBorder(width - 1, y);
  }

  return {
    transparentRatio: total ? transparent / total : 0,
    borderTransparentRatio: borderTotal ? borderTransparent / borderTotal : 0,
  };
}

function collectPngFiles(directory) {
  const found = [];

  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      found.push(...collectPngFiles(path));
    } else if (/\.png$/i.test(entry)) {
      found.push(path);
    }
  }

  return found;
}

const portraitFiles = PORTRAIT_DIRECTORIES.flatMap((directory) =>
  collectPngFiles(join(IMAGE_ROOT, ...directory.split("/"))),
).sort();

const cutouts = [];
const skipped = [];

for (const file of portraitFiles) {
  const publicPath = `/images/${posix.join(
    ...relative(IMAGE_ROOT, file).split(/[\\/]/),
  )}`;

  const measurement = measureTransparency(file);
  if (!measurement) {
    skipped.push(publicPath);
    continue;
  }

  const { transparentRatio, borderTransparentRatio } = measurement;
  if (
    transparentRatio >= MIN_TRANSPARENT_RATIO &&
    borderTransparentRatio >= MIN_TRANSPARENT_BORDER_RATIO
  ) {
    cutouts.push(publicPath);
    console.log(
      `cutout  ${publicPath} (${(transparentRatio * 100).toFixed(1)}% transparent, ${(borderTransparentRatio * 100).toFixed(1)}% transparent border)`,
    );
  }
}

writeFileSync(MANIFEST_PATH, `${JSON.stringify(cutouts, null, 2)}\n`, "utf8");

console.log(
  `\n${cutouts.length} cutout portrait(s) written to ${relative(PROJECT_ROOT, MANIFEST_PATH)}` +
    (skipped.length ? ` (${skipped.length} PNG(s) had no alpha channel)` : ""),
);
