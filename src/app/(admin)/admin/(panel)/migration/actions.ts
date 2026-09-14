"use server";

import { statSync } from "node:fs";
import path from "node:path";
import { importLocalAdminData, type LocalImportSummary } from "@/lib/supabase/local-import";
import { requireAdminOwner } from "@/lib/admin-authorization";
import { getAdminMediaLibrary, invalidateAdminMediaLibrary } from "@/lib/admin-media";
import { hasR2Object, putR2File, requireR2Config } from "@/lib/cloudflare-r2";
import { getCurrentAdminProfileId } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function runLocalDataImport(previous: LocalImportSummary | null, formData: FormData): Promise<LocalImportSummary> {
  void previous;
  await requireAdminOwner();
  if (formData.get("confirmImport") !== "on") {
    return { ok: false, counts: {}, error: "Confirm that matching Supabase records may be overwritten before starting the import." };
  }
  try {
    return await importLocalAdminData();
  } catch (error) {
    return { ok: false, counts: {}, error: error instanceof Error ? error.message : "The local data import failed." };
  }
}

export async function migrateLocalDocumentsToR2(previous: LocalImportSummary | null, formData: FormData): Promise<LocalImportSummary> {
  void previous;
  void formData;
  await requireAdminOwner();

  try {
    const supabase = await createSupabaseServerClient();
    const profileId = await getCurrentAdminProfileId(supabase);
    const publicRoot = path.resolve(process.cwd(), "public");
    const documents = getAdminMediaLibrary().filter((item) => item.kind === "document");
    const counts: Record<string, number> = { documents: 0 };

    for (const document of documents) {
      const relativePath = document.src.replace(/^\/+/, "");
      const { data: existingByR2Key, error: r2LookupError } = await supabase
        .from("media_assets")
        .select("id, storage_provider, storage_key, public_url")
        .eq("storage_key", relativePath)
        .maybeSingle();
      if (r2LookupError) throw new Error(`${document.filename}: ${r2LookupError.message}`);
      if (existingByR2Key?.storage_provider === "r2") {
        counts.documents += 1;
        continue;
      }
      const { data: existingByLocalUrl, error: localLookupError } = await supabase
        .from("media_assets")
        .select("id")
        .eq("public_url", document.src)
        .maybeSingle();
      if (localLookupError) throw new Error(`${document.filename}: ${localLookupError.message}`);
      if (!existingByLocalUrl) throw new Error(`${document.filename}: no matching Supabase media record was found.`);
      const filePath = path.resolve(publicRoot, relativePath);
      if (!filePath.startsWith(`${publicRoot}${path.sep}`)) throw new Error(`Unsafe document path: ${document.filename}`);
      const statistics = statSync(filePath);
      const publicUrl = await putR2File({
        key: relativePath,
        filePath,
        contentType: documentMimeType(document.extension),
        contentLength: statistics.size,
      });
      const { data, error } = await supabase
        .from("media_assets")
        .update({
          storage_provider: "r2",
          storage_key: relativePath,
          public_url: publicUrl,
          size_bytes: statistics.size,
          mime_type: documentMimeType(document.extension),
          source_url: publicUrl,
          created_by: profileId,
        })
        .eq("id", existingByLocalUrl.id)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(`${document.filename}: ${error.message}`);
      if (!data) throw new Error(`${document.filename}: Supabase media record could not be updated.`);
      counts.documents += 1;
    }

    invalidateAdminMediaLibrary();
    return { ok: true, counts };
  } catch (error) {
    return { ok: false, counts: {}, error: error instanceof Error ? error.message : "The document migration failed." };
  }
}

export async function migrateLocalImagesToR2(previous: LocalImportSummary | null, formData: FormData): Promise<LocalImportSummary> {
  void previous;
  void formData;
  await requireAdminOwner();

  try {
    const supabase = await createSupabaseServerClient();
    const { publicBaseUrl } = requireR2Config();
    const rows: Array<{ id: string; public_url: string; mime_type: string; storage_provider: string }> = [];
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("media_assets")
        .select("id, public_url, mime_type, storage_provider")
        .eq("storage_provider", "external")
        .like("public_url", "/%")
        .range(from, from + pageSize - 1);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) break;
    }

    const images = rows.filter((row) => isImagePath(row.public_url) || row.mime_type.startsWith("image/"));
    let migrated = 0;
    for (let from = 0; from < images.length; from += 20) {
      const batch = images.slice(from, from + 20);
      await Promise.all(batch.map(async (row) => {
        const key = row.public_url.replace(/^\/+/, "");
        if (!await hasR2Object(key)) throw new Error(`${key}: object was not found in R2.`);
        const nextUrl = `${publicBaseUrl}/${key}`;
        const { data, error } = await supabase
          .from("media_assets")
          .update({ storage_provider: "r2", storage_key: key, public_url: nextUrl, source_url: nextUrl })
          .eq("id", row.id)
          .select("id")
          .maybeSingle();
        if (error) throw new Error(`${key}: ${error.message}`);
        if (!data) throw new Error(`${key}: Supabase media record could not be updated.`);
      }));
      migrated += batch.length;
    }

    invalidateAdminMediaLibrary();
    return { ok: true, counts: { images: migrated } };
  } catch (error) {
    return { ok: false, counts: {}, error: error instanceof Error ? error.message : "The image migration failed." };
  }
}

function documentMimeType(extension: string) {
  if (extension === "pdf") return "application/pdf";
  if (extension === "doc") return "application/msword";
  if (extension === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (extension === "xls") return "application/vnd.ms-excel";
  if (extension === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (extension === "ppt") return "application/vnd.ms-powerpoint";
  if (extension === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (extension === "csv") return "text/csv";
  if (extension === "txt") return "text/plain";
  if (extension === "zip") return "application/zip";
  return "application/octet-stream";
}

function isImagePath(value: string) {
  return /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(value.split(/[?#]/, 1)[0]);
}
