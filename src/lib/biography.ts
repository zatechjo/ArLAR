export function formatBiographyPreview(lines: readonly string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (/[.!?]$/.test(line) ? line : `${line}.`))
    .join(" ");
}
