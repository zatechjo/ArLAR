"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  deleteAdminRecordAsync,
  permanentlyDeleteAdminRecordAsync,
  restoreAdminRecordAsync,
  type AdminDeletionScope,
} from "@/lib/admin-deletion-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import type { AdminPermission } from "@/lib/access-control-types";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { getManagedDoctorAsync } from "@/lib/admin-doctor-repository";
import { revalidateLocalizedPaths, revalidatePublicSitemap } from "@/lib/public-revalidation";

const allowedScopes = new Set<AdminDeletionScope>([
  "doctors",
  "college-events",
  "congresses",
  "congress-replays",
  "sigs",
  "professional-resources",
  "member-countries",
  "member-societies",
  "arlar27-committee",
  "arlar27-faculty",
]);

export async function deleteAdminRecordAction(scope: AdminDeletionScope, id: string) {
  if (!allowedScopes.has(scope)) throw new Error("Unsupported deletion scope.");
  const actor = await requireAdminPermission(permissionForScope(scope));
  const doctorPaths = scope === "doctors" ? await getDoctorPublicPaths(id) : [];
  await deleteAdminRecordAsync(scope, id);
  await recordAdminAuditLogAsync({ module: permissionForScope(scope), action: "Deleted", entityType: scope, entityId: id, targetLabel: id, detail: `Moved ${scope} record to trash.`, actorEmail: actor.email });
  revalidateAdminSurfaces(scope, id, doctorPaths);
}

export async function restoreAdminRecordAction(scope: AdminDeletionScope, id: string) {
  if (!allowedScopes.has(scope)) throw new Error("Unsupported deletion scope.");
  const actor = await requireAdminPermission(permissionForScope(scope));
  const doctorPaths = scope === "doctors" ? await getDoctorPublicPaths(id) : [];
  await restoreAdminRecordAsync(scope, id);
  await recordAdminAuditLogAsync({ module: permissionForScope(scope), action: "Restored", entityType: scope, entityId: id, targetLabel: id, detail: `Restored ${scope} record from trash.`, actorEmail: actor.email });
  revalidateAdminSurfaces(scope, id, doctorPaths);
}

export async function permanentlyDeleteAdminRecordAction(scope: AdminDeletionScope, id: string) {
  if (!allowedScopes.has(scope)) throw new Error("Unsupported deletion scope.");
  const actor = await requireAdminPermission(permissionForScope(scope));
  const doctorPaths = scope === "doctors" ? await getDoctorPublicPaths(id) : [];
  await permanentlyDeleteAdminRecordAsync(scope, id);
  await recordAdminAuditLogAsync({ module: permissionForScope(scope), action: "Permanently deleted", entityType: scope, entityId: id, targetLabel: id, detail: `Permanently removed ${scope} record.`, actorEmail: actor.email });
  revalidateAdminSurfaces(scope, id, doctorPaths);
}

function revalidateAdminSurfaces(scope: AdminDeletionScope, id: string, doctorPaths: string[] = []) {
  updateTag("public-deletions");
  revalidatePath("/admin", "layout");
  revalidateLocalizedPaths([...publicPathsForScope(scope, id), ...doctorPaths]);
  if (scope === "sigs" || scope === "congresses") revalidatePublicSitemap();
}

function publicPathsForScope(scope: AdminDeletionScope, id: string) {
  if (scope === "doctors") return ["/", "/about/board", "/about/scientific-committee", "/about/media-group", "/about/president-message", "/college/about", "/college/members", "/congresses/arlar21"];
  if (scope === "college-events") return ["/", "/college", "/college/about", "/college/events", "/education", "/special-interest-groups"];
  if (scope === "congresses" || scope === "congress-replays") return ["/education", "/congresses/arlar21", "/congresses/arlar21-replay", "/congresses/arlar23-replay"];
  if (scope === "sigs") return ["/", "/special-interest-groups", `/special-interest-groups/${id}`];
  if (scope === "professional-resources") return ["/education", "/professionals/publications", "/professionals/e-bulletin", "/professionals/partners"];
  if (scope === "member-countries" || scope === "member-societies") return ["/", "/members"];
  return ["/congresses/arlar27/committee", "/congresses/arlar27/faculty"];
}

async function getDoctorPublicPaths(id: string) {
  const doctor = await getManagedDoctorAsync(id);
  return doctor?.appearances.map((appearance) => appearance.path).filter((path) => path.startsWith("/")) ?? [];
}

function permissionForScope(scope: AdminDeletionScope): AdminPermission {
  if (scope === "doctors") return "doctors";
  if (scope === "college-events") return "college";
  if (scope === "congresses" || scope === "congress-replays") return "congresses";
  if (scope === "sigs") return "sigs";
  if (scope === "professional-resources") return "resources";
  if (scope === "member-countries" || scope === "member-societies") return "members";
  return "arlar27";
}
