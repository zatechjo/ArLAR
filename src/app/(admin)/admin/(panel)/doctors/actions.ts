"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminPermission } from "@/lib/admin-authorization";
import { createManagedDoctorIdAsync, getManagedDoctorAsync, saveManagedDoctorAsync } from "@/lib/admin-doctor-repository";
import type { DoctorAppearance, DoctorRecord } from "@/data/doctor-types";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths } from "@/lib/public-revalidation";

export async function saveDoctorAction(id: string, formData: FormData) {
  const actor = await requireAdminPermission("doctors");
  const existing = id === "new" ? undefined : await getManagedDoctorAsync(id);
  if (id !== "new" && !existing) throw new Error("Doctor not found.");
  const name = required(formData, "name");
  const credentials = text(formData, "credentials");
  const resolvedId = existing?.id || await createManagedDoctorIdAsync(name);
  const displayName = text(formData, "public_display_name") || (credentials ? `${name}, ${credentials}` : name);
  const country = required(formData, "country");
  const portrait = text(formData, "portrait");
  const flag = assetMedia(text(formData, "country_flag"));
  const variants = stringArray(formData.get("name_variants"));
  const appearances = appearanceArray(formData.get("appearances"));
  const record: DoctorRecord = {
    id: resolvedId, slug: existing?.slug || resolvedId, name, credentials, fullName: displayName, country,
    countryCode: existing?.countryCode || "", flagFilename: flag, biography: paragraphs(formData.get("biography")),
    nameAr: text(formData, "name_ar"), biographyAr: lines(formData.get("biography_ar")),
    nameFr: text(formData, "name_fr"), biographyFr: lines(formData.get("biography_fr")),
    image: portrait || existing?.image || "/images/college-members/profile-placeholder.jpg",
    imagePosition: cropPosition(formData) || existing?.imagePosition,
    aliases: existing?.aliases || [], sourceFullNames: [...new Set([...(existing?.sourceFullNames || []), ...variants])],
    availableOn: [...new Set(appearances.map((appearance) => appearance.pageId))], appearances,
  };
  await saveManagedDoctorAsync(record);
  await recordAdminAuditLogAsync({ module: "doctors", action: id === "new" ? "Doctor created" : "Doctor saved", entityType: "doctor", entityId: resolvedId, targetLabel: record.fullName, detail: `Doctor profile updated with ${record.appearances.length} page placement(s).`, actorEmail: actor.email });
  revalidatePath("/admin/doctors");
  revalidatePath(`/admin/doctors/${resolvedId}`);
  const affectedPaths = [...(existing?.appearances || []), ...record.appearances]
    .map((appearance) => appearance.path)
    .filter((path) => path.startsWith("/"));
  if (affectedPaths.includes("/college/members")) affectedPaths.push("/college/about");
  revalidateLocalizedPaths(["/", ...affectedPaths]);
  redirect(`/admin/doctors/${resolvedId}?saved=1`);
}

function text(formData: FormData, name: string) { return String(formData.get(name) || "").trim(); }
function required(formData: FormData, name: string) { const value = text(formData, name); if (!value) throw new Error(`The ${name} field is required.`); return value; }
function assetMedia(value: string) {
  const clean = value.replaceAll("\\", "/");
  if (/^https?:\/\//i.test(clean)) return clean;
  return clean.split("/").filter(Boolean).at(-1) || "";
}
function paragraphs(value: FormDataEntryValue | null) { return String(value || "").split(/\r?\n\s*\r?\n/).map((item) => item.trim()).filter(Boolean); }
/** Arabic and French bios are stored one line per entry, matching how those sites list them. */
function lines(value: FormDataEntryValue | null) { return String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean); }
function stringArray(value: FormDataEntryValue | null): string[] { return parseArray(value).filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim()); }
function appearanceArray(value: FormDataEntryValue | null): DoctorAppearance[] { return parseArray(value).flatMap((item) => { if (!item || typeof item !== "object") return []; const entry = item as Record<string, unknown>; const id = String(entry.id || "").trim(); if (!id) return []; const sortOrder = Number(entry.sortOrder); const hasVersionedOrder = entry.sortOrderVersion === 1 && Number.isFinite(sortOrder) && sortOrder > 0; return [{ id, pageId: String(entry.pageId || ""), pageTitle: String(entry.pageTitle || ""), path: String(entry.path || ""), section: String(entry.section || ""), role: String(entry.role || ""), ...(hasVersionedOrder ? { sortOrder, sortOrderVersion: 1 as const } : {}) }]; }); }
function parseArray(value: FormDataEntryValue | null): unknown[] { try { const parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function cropPosition(formData: FormData) { if (formData.get("portrait_crop_dirty") !== "true") return ""; const x = Number(formData.get("portrait_crop_x")); const y = Number(formData.get("portrait_crop_y")); return Number.isFinite(x) && Number.isFinite(y) ? `${Math.round(x)}% ${Math.round(y)}%` : ""; }
