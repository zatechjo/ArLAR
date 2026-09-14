"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getManagedMemberCountryAsync,
  makeMemberCountrySlug,
  saveManagedMemberCountryAsync,
  type ManagedMemberSociety,
} from "@/lib/member-societies-repository";
import { getDeletedAdminRecordIdsAsync } from "@/lib/admin-deletion-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths } from "@/lib/public-revalidation";

export async function saveMemberCountryAction(slug: string, formData: FormData) {
  const actor = await requireAdminPermission("members");
  const [existing, deletedSocietyIds] = await Promise.all([getManagedMemberCountryAsync(slug), getDeletedAdminRecordIdsAsync("member-societies")]);
  const country = String(formData.get("country") || "").trim();
  const countryCode = String(formData.get("countryCode") || "").trim();
  const resolvedSlug = existing?.slug || makeMemberCountrySlug(country, countryCode);
  const activeSocieties = parseSocieties(formData.get("societies"));
  const trashedSocieties = (existing?.societies || []).filter(
    (society) => deletedSocietyIds.has(society.id) && !activeSocieties.some((candidate) => candidate.id === society.id),
  );
  await saveManagedMemberCountryAsync({
    country,
    countryCode,
    slug: resolvedSlug,
    flag: assetFilename(formData.get("flag")),
    background: assetFilename(formData.get("background")),
    backgroundCredit: String(formData.get("backgroundCredit") || ""),
    societies: [...activeSocieties, ...trashedSocieties],
  });
  await recordAdminAuditLogAsync({ module: "members", action: "Member country saved", entityType: "member-country", entityId: resolvedSlug, targetLabel: country, detail: `${activeSocieties.length} active societies saved for this country.`, actorEmail: actor.email });
  revalidateMemberSurfaces();
  redirect(`/admin/members/${resolvedSlug}?saved=1`);
}

function assetFilename(value: FormDataEntryValue | null) {
  const clean = String(value || "").trim().replaceAll("\\", "/");
  if (/^https?:\/\//i.test(clean)) return clean;
  return clean.split("/").filter(Boolean).at(-1) || "";
}

function parseSocieties(value: FormDataEntryValue | null): ManagedMemberSociety[] {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    if (!Array.isArray(parsed)) throw new Error();
    return parsed as ManagedMemberSociety[];
  } catch {
    throw new Error("The society list could not be saved.");
  }
}

function revalidateMemberSurfaces() {
  revalidatePath("/admin/members");
  revalidateLocalizedPaths(["/", "/members"]);
}
