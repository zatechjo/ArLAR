"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getAdminAccessUserAsync,
  createAdminAccessUserAsync,
  removeAdminAccessUserAsync,
  renewAdminInvitationAsync,
  saveAdminAccessUserAsync,
} from "@/lib/access-control-repository";
import { accessPermissionDefinitions, roleDefaultPermissions, roleLabels, type AdminAccessStatus, type AdminPermission, type AdminRole } from "@/lib/access-control-types";
import { requireAdminOwner } from "@/lib/admin-authorization";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";

export type AccessActionState = { success: boolean; message: string; userId?: string };

export async function createAdministratorAction(_previous: AccessActionState, formData: FormData): Promise<AccessActionState> {
  const actor = await requireAdminOwner();
  const name = value(formData, "name", 160);
  const email = value(formData, "email", 240);
  const password = value(formData, "password", 200);
  const passwordConfirmation = value(formData, "password_confirmation", 200);
  const role = accessRole(formData.get("role"));
  if (!name || !email) return { success: false, message: "Enter the administrator’s name and email address." };
  if (password.length < 10) return { success: false, message: "Use a password with at least 10 characters." };
  if (password !== passwordConfirmation) return { success: false, message: "The password confirmation does not match." };
  try {
    const selected = permissionList(formData);
    const user = await createAdminAccessUserAsync({ name, email, password, role, permissions: selected.length ? selected : roleDefaultPermissions[role] });
    await recordAdminAuditLogAsync({ module: "access", action: "Administrator created", entityType: "administrator", entityId: user.id, targetLabel: user.email, detail: `${roleLabels[role]} account created with ${user.permissions.length} module permissions.`, actorEmail: actor.email });
    revalidateAccess(user.id);
    return { success: true, message: "Administrator created. They can sign in immediately with this email and password.", userId: user.id };
  } catch (error) {
    return { success: false, message: errorMessage(error, "Unable to create this administrator.") };
  }
}

export async function saveAdministratorAction(id: string, formData: FormData) {
  const actor = await requireAdminOwner();
  const existing = await getAdminAccessUserAsync(id);
  if (!existing) throw new Error("Administrator not found.");
  const role = accessRole(formData.get("role"));
  await saveAdminAccessUserAsync({
    ...existing,
    name: value(formData, "name", 160) || existing.name,
    role,
    status: accessStatus(formData.get("status")),
    permissions: permissionList(formData),
  });
  await recordAdminAuditLogAsync({ module: "access", action: "Access updated", entityType: "administrator", entityId: id, targetLabel: existing.email, detail: `${roleLabels[role]} role and access status updated.`, actorEmail: actor.email });
  revalidateAccess(id);
  redirect(`/admin/access/${id}?saved=1`);
}

export async function renewAdministratorInvitationAction(id: string) {
  const actor = await requireAdminOwner();
  const user = await renewAdminInvitationAsync(id);
  await recordAdminAuditLogAsync({ module: "access", action: "Invitation renewed", entityType: "administrator", entityId: id, targetLabel: user.email, detail: "Administrator invitation renewed.", actorEmail: actor.email });
  revalidateAccess(id);
}

export async function removeAdministratorAction(id: string) {
  const actor = await requireAdminOwner();
  const user = await getAdminAccessUserAsync(id);
  await removeAdminAccessUserAsync(id);
  await recordAdminAuditLogAsync({ module: "access", action: "Access removed", entityType: "administrator", entityId: id, targetLabel: user?.email || id, detail: "Administrator access revoked.", actorEmail: actor.email });
  revalidateAccess(id);
}

function revalidateAccess(id: string) {
  revalidatePath("/admin/access");
  revalidatePath(`/admin/access/${id}`);
}

function permissionList(formData: FormData): AdminPermission[] {
  const allowed = new Set(accessPermissionDefinitions.map((permission) => permission.id));
  return [...new Set(formData.getAll("permissions").map(String).filter((permission): permission is AdminPermission => allowed.has(permission as AdminPermission)))];
}

function accessRole(value: FormDataEntryValue | null): Exclude<AdminRole, "owner"> { return value === "editor" ? "editor" : "contributor"; }
function accessStatus(value: FormDataEntryValue | null): AdminAccessStatus { return value === "active" ? "active" : value === "suspended" ? "suspended" : "invited"; }
function value(formData: FormData, name: string, max: number) { return String(formData.get(name) || "").trim().slice(0, max); }
function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message.trim()) return error.message;
  return fallback;
}
