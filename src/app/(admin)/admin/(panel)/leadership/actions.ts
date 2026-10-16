"use server";

import { revalidatePath } from "next/cache";

import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { listManagedDoctorsAsync, saveManagedDoctorAsync, saveManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { revalidateLocalizedPaths } from "@/lib/public-revalidation";

type LeadershipPageId = "board-of-directors" | "scientific-committee" | "media-group";

const leadershipPages: Record<LeadershipPageId, { title: string; path: string; sections: readonly string[] }> = {
  "board-of-directors": {
    title: "Board of Directors",
    path: "/about/board",
    sections: ["Executive Council", "Board Members"],
  },
  "scientific-committee": {
    title: "Scientific Committee",
    path: "/about/scientific-committee",
    sections: ["Scientific Committee"],
  },
  "media-group": {
    title: "ArLAR Media Group",
    path: "/about/media-group",
    sections: ["Media Group"],
  },
};

function getLeadershipPage(pageId: string) {
  const page = leadershipPages[pageId as LeadershipPageId];
  if (!page) throw new Error("Unknown ArLAR leadership page.");
  return page;
}

function placementKey(doctorId: string, appearanceId: string) {
  return `${doctorId}\u0000${appearanceId}`;
}

export async function addDoctorToLeadershipAction(pageId: string, formData: FormData) {
  const actor = await requireAdminPermission("doctors");
  const page = getLeadershipPage(pageId);
  const doctors = await listManagedDoctorsAsync();
  const doctor = doctors.find((item) => item.id === String(formData.get("doctor_id") || ""));
  if (!doctor) throw new Error("Choose a doctor from the directory.");
  if (doctor.appearances.some((appearance) => appearance.pageId === pageId)) {
    throw new Error(`This doctor is already linked to the ${page.title}.`);
  }

  const section = String(formData.get("section") || "").trim();
  if (!page.sections.includes(section)) throw new Error("Choose a valid leadership section.");
  const role = String(formData.get("role") || "").trim().slice(0, 160);
  const sectionId = section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const existingOrders = doctors.flatMap((item) => item.appearances
    .filter((appearance) => appearance.pageId === pageId && appearance.section === section && appearance.sortOrderVersion === 1)
    .map((appearance) => appearance.sortOrder || 0));
  const appearance = {
    id: `${pageId}:${sectionId}`,
    pageId,
    pageTitle: page.title,
    path: page.path,
    section,
    role,
    sortOrder: Math.max(0, ...existingOrders) + 1,
    sortOrderVersion: 1 as const,
  };

  await saveManagedDoctorAsync({
    ...doctor,
    appearances: [...doctor.appearances, appearance],
    availableOn: [...new Set([...doctor.availableOn, pageId])],
  });
  await recordAdminAuditLogAsync({
    module: "doctors",
    action: "Leadership doctor linked",
    entityType: "leadership-roster",
    entityId: pageId,
    targetLabel: doctor.fullName,
    detail: `${doctor.fullName} added to ${page.title}${role ? ` as ${role}` : ""}.`,
    actorEmail: actor.email,
  });
  revalidatePath("/admin/leadership");
  revalidatePath(`/admin/doctors/${doctor.id}`);
  revalidateLocalizedPaths([page.path]);
}

export async function setLeadershipDoctorOrderAction(
  pageId: string,
  sectionOrders: { section: string; orderedPlacements: { doctorId: string; appearanceId: string }[] }[],
) {
  const actor = await requireAdminPermission("doctors");
  const page = getLeadershipPage(pageId);
  if (!Array.isArray(sectionOrders) || sectionOrders.length === 0 || sectionOrders.length > page.sections.length) {
    throw new Error("Invalid leadership order.");
  }
  const requestedSections = sectionOrders.map((item) => String(item.section || "").trim());
  const totalPlacements = sectionOrders.reduce(
    (total, item) => total + (Array.isArray(item.orderedPlacements) ? item.orderedPlacements.length : 501),
    0,
  );
  if (
    totalPlacements > 500
    || requestedSections.some((section) => !page.sections.includes(section))
    || new Set(requestedSections).size !== requestedSections.length
  ) throw new Error("Invalid leadership order.");

  const doctors = await listManagedDoctorsAsync();
  const orderByPlacement = new Map<string, number>();
  for (const { section, orderedPlacements } of sectionOrders) {
    const existing = doctors.flatMap((doctor) => doctor.appearances
      .filter((appearance) => appearance.pageId === pageId && appearance.section === section)
      .map((appearance) => placementKey(doctor.id, appearance.id)));
    const requested = orderedPlacements.map((item) => placementKey(String(item.doctorId || ""), String(item.appearanceId || "")));
    if (new Set(requested).size !== requested.length || existing.length !== requested.length || existing.some((item) => !requested.includes(item))) {
      throw new Error("The leadership roster changed. Refresh the page and try again.");
    }
    requested.forEach((item, index) => orderByPlacement.set(item, index + 1));
  }

  const changed = doctors.flatMap((doctor) => {
    let dirty = false;
    const appearances = doctor.appearances.map((appearance) => {
      const sortOrder = orderByPlacement.get(placementKey(doctor.id, appearance.id));
      if (!sortOrder || (sortOrder === appearance.sortOrder && appearance.sortOrderVersion === 1)) return appearance;
      dirty = true;
      return { ...appearance, sortOrder, sortOrderVersion: 1 as const };
    });
    return dirty ? [{ ...doctor, appearances }] : [];
  });

  await saveManagedDoctorsAsync(changed);
  await recordAdminAuditLogAsync({
    module: "doctors",
    action: "Leadership order updated",
    entityType: "leadership-roster",
    entityId: pageId,
    targetLabel: page.title,
    detail: `${sectionOrders.length} ${sectionOrders.length === 1 ? "section" : "sections"} reordered.`,
    actorEmail: actor.email,
  });
  revalidatePath("/admin/leadership");
  for (const doctor of changed) revalidatePath(`/admin/doctors/${doctor.id}`);
  revalidateLocalizedPaths([page.path]);
}
