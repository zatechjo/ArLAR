import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "src/data/sig-profiles.ts");
const outputDir = path.join(root, "public/images/sig-members");
const source = await readFile(sourcePath, "utf8");
const lines = source.split(/\r?\n/);
const portraitUrls = new Set();

for (const line of lines) {
  if (!line.includes("name:") || !line.includes("image:")) continue;
  const match = line.match(/image:\s*"(https:\/\/static\.wixstatic\.com\/media\/[^\"]+)"/);
  if (match) portraitUrls.add(match[1]);
}

await mkdir(outputDir, { recursive: true });
let downloaded = 0;
for (const url of portraitUrls) {
  const mediaName = url.split("/media/")[1];
  const filename = mediaName.replace(/[^a-zA-Z0-9._~-]/g, "-");
  const destination = path.join(outputDir, filename);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  downloaded += 1;
  console.log(`${downloaded}/${portraitUrls.size} ${filename}`);
}

let updatedSource = source;
for (const url of portraitUrls) {
  const filename = url.split("/media/")[1].replace(/[^a-zA-Z0-9._~-]/g, "-");
  updatedSource = updatedSource.replaceAll(url, `/images/sig-members/${filename}`);
}
await writeFile(sourcePath, updatedSource, "utf8");
console.log(`Downloaded ${downloaded} unique SIG portraits to ${path.relative(root, outputDir)}.`);
