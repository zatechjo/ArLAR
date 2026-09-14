"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  setManagedSigOrderAsync,
  setManagedSigVisibilityAsync,
  updateManagedSigAsync,
  getManagedSigAsync,
} from "@/lib/sig-directory-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths, revalidatePublicSitemap } from "@/lib/public-revalidation";
import { listManagedDoctorsAsync, saveManagedDoctorAsync, saveManagedDoctorsAsync } from "@/lib/admin-doctor-repository";

export async function saveSigIdentityAction(slug: string, formData: FormData) {
  const actor = await requireAdminPermission("sigs");
  const identity = {
    name: String(formData.get("name") || "").trim(),
    abbreviation: String(formData.get("abbreviation") || "").trim(),
    logo: String(formData.get("logo") || "").trim(),
    visible: formData.get("visible") === "on",
  };
  await updateManagedSigAsync(slug, identity);
  await recordAdminAuditLogAsync({ module: "sigs", action: "SIG saved", entityType: "special-interest-group", entityId: slug, targetLabel: String(formData.get("name") || slug), detail: "Special interest group identity updated.", actorEmail: actor.email });
  revalidateSigSurfaces(slug);
  redirect(`/admin/sigs/${slug}?saved=1`);
}

export async function setSigVisibilityAction(slug: string, visible: boolean) {
  const actor = await requireAdminPermission("sigs");
  await setManagedSigVisibilityAsync(slug, Boolean(visible));
  await recordAdminAuditLogAsync({ module: "sigs", action: visible ? "SIG published" : "SIG hidden", entityType: "special-interest-group", entityId: slug, targetLabel: slug, detail: visible ? "Special interest group made visible." : "Special interest group hidden.", actorEmail: actor.email });
  revalidateSigSurfaces(slug);
}

export async function setSigOrderAction(slugs: string[]) {
  const actor = await requireAdminPermission("sigs");
  await setManagedSigOrderAsync(slugs);
  await recordAdminAuditLogAsync({ module: "sigs", action: "SIG order updated", entityType: "special-interest-groups", entityId: "directory", targetLabel: "SIG directory", detail: `${slugs.length} group order entries saved.`, actorEmail: actor.email });
  revalidateSigSurfaces();
}

export async function addDoctorToSigAction(slug: string, formData: FormData) {
  const actor = await requireAdminPermission("sigs");
  const [group, doctors] = await Promise.all([
    getManagedSigAsync(slug, "admin"),
    listManagedDoctorsAsync(),
  ]);
  const doctor = doctors.find((item) => item.id === String(formData.get("doctor_id") || ""));
  if (!group) throw new Error("SIG not found.");
  if (!doctor) throw new Error("Choose a doctor from the directory.");
  const section = String(formData.get("section") || "Members").trim().slice(0, 120) || "Members";
  const role = String(formData.get("role") || "SIG member").trim().slice(0, 160);
  const path = `/special-interest-groups/${slug}`;
  const pageId = slug === "arab-adult-arthritis-awareness" ? "sig-aaaa" : `sig-${slug}`;
  if (doctor.appearances.some((appearance) => appearance.pageId === pageId && appearance.section.trim().toLowerCase() === section.toLowerCase())) throw new Error("This doctor is already linked to that SIG section.");
  const sectionId = section.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "members";
  const existingOrders = doctors.flatMap((item) => item.appearances.filter((appearance) => appearance.pageId === pageId && appearance.section === section && appearance.sortOrderVersion === 1).map((appearance) => appearance.sortOrder || 0));
  const appearance = { id: `${pageId}:${sectionId}`, pageId, pageTitle: group.name, path, section, role, sortOrder: Math.max(0, ...existingOrders) + 1, sortOrderVersion: 1 as const };
  await saveManagedDoctorAsync({ ...doctor, appearances: [...doctor.appearances, appearance], availableOn: [...new Set([...doctor.availableOn, pageId])] });
  await recordAdminAuditLogAsync({ module: "sigs", action: "Doctor linked", entityType: "special-interest-group", entityId: slug, targetLabel: doctor.fullName, detail: `${doctor.fullName} added to ${group.name} as ${role || section}.`, actorEmail: actor.email });
  revalidatePath("/admin/sigs");
  revalidatePath(`/admin/sigs/${slug}`);
  revalidatePath(`/admin/doctors/${doctor.id}`);
  revalidateLocalizedPaths([path]);
}

export async function setSigDoctorOrderAction(slug: string, sectionOrders: { section: string; orderedPlacements: { doctorId: string; appearanceId: string }[] }[]) {
  const actor = await requireAdminPermission("sigs");
  if (!Array.isArray(sectionOrders) || sectionOrders.length === 0 || sectionOrders.length > 20) throw new Error("Invalid SIG order.");
  const totalPlacements = sectionOrders.reduce((total, item) => total + (Array.isArray(item.orderedPlacements) ? item.orderedPlacements.length : 501), 0);
  const requestedSections = sectionOrders.map((item) => String(item.section || "").trim());
  if (totalPlacements > 500 || requestedSections.some((section) => !section) || new Set(requestedSections).size !== requestedSections.length) throw new Error("Invalid SIG order.");
  const [group, doctors] = await Promise.all([getManagedSigAsync(slug, "admin"), listManagedDoctorsAsync()]);
  if (!group) throw new Error("SIG not found.");
  const pageId = slug === "arab-adult-arthritis-awareness" ? "sig-aaaa" : `sig-${slug}`;
  const key = (doctorId: string, appearanceId: string) => `${doctorId}\u0000${appearanceId}`;
  const orderByPlacement = new Map<string, number>();
  for (const { section, orderedPlacements } of sectionOrders) {
    const existing = doctors.flatMap((doctor) => doctor.appearances
      .filter((appearance) => appearance.pageId === pageId && appearance.section === section)
      .map((appearance) => key(doctor.id, appearance.id)));
    const requested = orderedPlacements.map((item) => key(String(item.doctorId || ""), String(item.appearanceId || "")));
    if (new Set(requested).size !== requested.length || existing.length !== requested.length || existing.some((item) => !requested.includes(item))) throw new Error("The SIG roster changed. Refresh the page and try again.");
    requested.forEach((item, index) => orderByPlacement.set(item, index + 1));
  }
  const changed = doctors.flatMap((doctor) => {
    let dirty = false;
    const appearances = doctor.appearances.map((appearance) => {
      const sortOrder = orderByPlacement.get(key(doctor.id, appearance.id));
      if (!sortOrder || (sortOrder === appearance.sortOrder && appearance.sortOrderVersion === 1)) return appearance;
      dirty = true;
      return { ...appearance, sortOrder, sortOrderVersion: 1 as const };
    });
    return dirty ? [{ ...doctor, appearances }] : [];
  });
  await saveManagedDoctorsAsync(changed);
  await recordAdminAuditLogAsync({ module: "sigs", action: "Doctor order updated", entityType: "special-interest-group", entityId: slug, targetLabel: group.name, detail: `${sectionOrders.length} public roster ${sectionOrders.length === 1 ? "section" : "sections"} reordered.`, actorEmail: actor.email });
  revalidatePath(`/admin/sigs/${slug}`);
  revalidateLocalizedPaths([`/special-interest-groups/${slug}`]);
}

function revalidateSigSurfaces(slug?: string) {
  updateTag("public-sigs");
  revalidatePath("/admin/sigs");
  revalidateLocalizedPaths(["/", "/special-interest-groups", ...(slug ? [`/special-interest-groups/${slug}`] : [])]);
  revalidatePublicSitemap();
}
