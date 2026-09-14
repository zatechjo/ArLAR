"use server";

import { randomUUID } from "node:crypto";

import { requireAdminSession } from "@/lib/admin-authorization";
import { invalidateAdminMediaLibrary, type AdminMediaItem } from "@/lib/admin-media";
import { createR2UploadUrl, deleteR2Object, getR2ObjectMetadata } from "@/lib/cloudflare-r2";
import { getCurrentAdminProfileId } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"]);
const DOCUMENT_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt", "zip"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v"]);
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 20;
const MAX_BATCH_SIZE = 100 * 1024 * 1024;

export type AdminMediaUploadRequest = { name: string; type: string; size: number };
export type AdminMediaUploadDescriptor = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  name: string;
  filename: string;
  kind: AdminMediaItem["kind"];
  extension: string;
  size: number;
  contentType: string;
};

export async function createAdminMediaUploadUrlsAction(requests: AdminMediaUploadRequest[]): Promise<AdminMediaUploadDescriptor[]> {
  await requireAdminSession();
  validateBatch(requests);
  const now = new Date();
  const relativeDirectory = `uploads/${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  return Promise.all(requests.map(async (file) => {
    const details = validateFile(file);
    const filename = `${details.base}-${randomUUID().slice(0, 8)}.${details.extension}`;
    const key = `${relativeDirectory}/${filename}`;
    const signed = await createR2UploadUrl({ key, contentType: details.contentType });
    return { key, uploadUrl: signed.uploadUrl, publicUrl: signed.publicUrl, name: details.name, filename, kind: details.kind, extension: details.extension, size: file.size, contentType: details.contentType };
  }));
}

export async function finalizeAdminMediaUploadsAction(items: Array<Pick<AdminMediaUploadDescriptor, "key" | "name" | "filename" | "kind" | "extension" | "size" | "contentType">>): Promise<AdminMediaItem[]> {
  await requireAdminSession();
  validateBatch(items);
  if (items.some((item) => !item.key.startsWith("uploads/") || item.key.includes(".."))) throw new Error("Invalid R2 object key.");

  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) throw new Error("Cloudflare R2 public URL is not configured.");

  const uploaded = await Promise.all(items.map(async (item) => {
    const metadata = await getR2ObjectMetadata(item.key);
    if (!metadata) throw new Error(`${item.filename} was not found in Cloudflare R2 after upload.`);
    if (metadata.contentLength !== item.size || metadata.contentLength > MAX_FILE_SIZE) {
      await deleteR2Object(item.key).catch(() => undefined);
      throw new Error(`${item.filename} did not match the validated upload size and was removed.`);
    }
    const src = `${baseUrl}/${item.key}`;
    const { error } = await supabase.from("media_assets").upsert({
      storage_provider: "r2",
      storage_key: item.key,
      public_url: src,
      original_name: item.filename,
      mime_type: item.contentType,
      size_bytes: item.size,
      folder: "New uploads",
      alt_text: item.name,
      source_url: src,
      created_by: createdBy,
    }, { onConflict: "storage_key" });
    if (error) {
      await deleteR2Object(item.key).catch(() => undefined);
      throw error;
    }
    return { src, name: item.name, filename: item.filename, folder: "New uploads", kind: item.kind, extension: item.extension, size: item.size, modifiedAt: Date.now() } satisfies AdminMediaItem;
  }));

  invalidateAdminMediaLibrary();
  return uploaded;
}

export async function deleteAdminMediaUploadsAction(keys: string[]) {
  await requireAdminSession();
  await Promise.all(keys.filter((key) => key.startsWith("uploads/") && !key.includes("..")).map((key) => deleteR2Object(key)));
}

function validateBatch(items: Array<{ size: number }>) {
  if (items.length > MAX_FILES_PER_UPLOAD) throw new Error(`Upload no more than ${MAX_FILES_PER_UPLOAD} files at once.`);
  if (items.reduce((total, file) => total + file.size, 0) > MAX_BATCH_SIZE) throw new Error("This upload exceeds the 100 MB batch limit.");
}

function validateFile(file: AdminMediaUploadRequest) {
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) throw new Error(`${file.name} exceeds the 25 MB upload limit.`);
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const kind = mediaKind(extension);
  if (!kind) throw new Error(`${file.name} is not a supported media type.`);
  if (!matchesDeclaredType(file.type, kind)) throw new Error(`${file.name} does not match its declared type.`);
  const name = file.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]+/g, " ");
  const base = file.name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "media";
  return { extension, kind, name, base, contentType: file.type || contentTypeFor(kind, extension) };
}

function matchesDeclaredType(mime: string, kind: AdminMediaItem["kind"]) {
  if (!mime || mime === "application/octet-stream") return true;
  if (kind === "image") return mime.startsWith("image/");
  if (kind === "video") return mime.startsWith("video/");
  return !mime.startsWith("image/") && !mime.startsWith("video/");
}

function mediaKind(extension: string): AdminMediaItem["kind"] | null {
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (DOCUMENT_EXTENSIONS.has(extension)) return "document";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return null;
}

function contentTypeFor(kind: AdminMediaItem["kind"], extension: string) {
  if (kind === "image") return extension === "svg" ? "image/svg+xml" : `image/${extension === "jpg" ? "jpeg" : extension}`;
  if (kind === "video") return `video/${extension}`;
  if (extension === "pdf") return "application/pdf";
  return "application/octet-stream";
}
