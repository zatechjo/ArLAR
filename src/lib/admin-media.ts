import "server-only";

import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { doctorDatabase } from "@/data/doctor-database";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminMediaItem = {
  src: string;
  name: string;
  filename: string;
  folder: string;
  kind: "image" | "document" | "video";
  extension: string;
  size: number;
  modifiedAt: number;
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"]);
const DOCUMENT_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".csv", ".txt", ".zip"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const DOCTOR_IMAGE_SOURCES = new Set(doctorDatabase.map((doctor) => doctor.image));

function mediaKind(extension: string): AdminMediaItem["kind"] | null {
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (DOCUMENT_EXTENSIONS.has(extension)) return "document";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return null;
}

function virtualFolder(src: string, filename: string, kind: AdminMediaItem["kind"]) {
  const lower = src.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  if (DOCTOR_IMAGE_SOURCES.has(src)) return "Doctor images";
  if (lower.includes("/aaaa-group/members/") || lower.includes("/board/") || lower.includes("/college-members/") || lower.includes("/media-group/") || lower.includes("/scientific-committee/")) return "Doctor images";
  if (lower.includes("/flags/") || lower.includes("/arab flags/")) return "Country flags";
  if (lower.includes("/wix-blog/") || lower.includes("/news/")) return "News images";
  if (lower.includes("/arlar-college") || lower.includes("/college/")) return "ArLAR College";
  if (/\/arlar(21|23|25|27)\//.test(lower) || lower.includes("/congress")) return "Congress media";
  if (lower.includes("bulletin") || lower.includes("publication") || lower.includes("document")) return "Publications & documents";
  if (lowerFilename.includes("logo") || lower.includes("/logos/") || lower.includes("/sigs/")) return "Logos & branding";
  if (kind === "document") return "Website documents";
  if (kind === "video") return "Website videos";
  return "Website images";
}

function walk(directory: string, publicRoot: string, output: AdminMediaItem[]) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute, publicRoot, output);
      continue;
    }
    const extension = path.extname(entry.name).toLowerCase();
    const kind = mediaKind(extension);
    if (!kind) continue;
    const relative = path.relative(publicRoot, absolute).replaceAll("\\", "/");
    const src = `/${relative}`;
    const statistics = statSync(absolute);
    output.push({
      src,
      name: path.basename(entry.name, path.extname(entry.name)).replaceAll(/[-_]+/g, " "),
      filename: entry.name,
      folder: virtualFolder(src, entry.name, kind),
      kind,
      extension: extension.slice(1),
      size: statistics.size,
      modifiedAt: statistics.mtimeMs,
    });
  }
}

let mediaCache: AdminMediaItem[] | null = null;

export function getAdminMediaLibrary() {
  if (mediaCache) return mediaCache;
  const publicRoot = path.join(process.cwd(), "public");
  const items: AdminMediaItem[] = [];
  walk(publicRoot, publicRoot, items);
  mediaCache = items.toSorted((a, b) => b.modifiedAt - a.modifiedAt || a.name.localeCompare(b.name));
  return mediaCache;
}

export function invalidateAdminMediaLibrary() {
  mediaCache = null;
}

export async function getAdminMediaLibraryAsync() {
  if (!getSupabasePublicConfig()) return getAdminMediaLibrary();
  try {
    const supabase = await createSupabaseServerClient();
    // PostgREST applies a 1,000-row response limit by default. Media libraries
    // can be larger than that, so page through the table instead of silently
    // dropping older assets (including documents) from the picker.
    const pageSize = 1000;
    const rows: Array<{
      storage_key: string;
      public_url: string;
      original_name: string | null;
      mime_type: string;
      size_bytes: number | null;
      folder: string | null;
      created_at: string;
    }> = [];
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("media_assets")
        .select("storage_key, public_url, original_name, mime_type, size_bytes, folder, created_at")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) break;
    }
    if (!rows.length) return getAdminMediaLibrary();
    return rows.map((row): AdminMediaItem => {
      const filename = row.original_name || row.storage_key.split("/").at(-1) || "media";
      const extension = filename.split(".").at(-1)?.toLowerCase() || "";
      const kind: AdminMediaItem["kind"] = row.mime_type.startsWith("image/") ? "image" : row.mime_type.startsWith("video/") ? "video" : "document";
      return { src: row.public_url, name: filename.replace(/\.[^.]+$/, "").replaceAll(/[-_]+/g, " "), filename, folder: row.folder || virtualFolder(row.public_url, filename, kind), kind, extension, size: Number(row.size_bytes) || 0, modifiedAt: Date.parse(row.created_at) || 0 };
    });
  } catch (error) {
    reportSupabaseReadFallback("admin-media-library", error);
    return getAdminMediaLibrary();
  }
}
