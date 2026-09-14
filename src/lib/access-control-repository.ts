import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  accessPermissionDefinitions,
  roleDefaultPermissions,
  type AdminAccessAuditEntry,
  type AdminAccessStatus,
  type AdminAccessUser,
  type AdminPermission,
  type AdminRole,
} from "@/lib/access-control-types";
import { recordAdminAuditLog } from "@/lib/admin-audit-repository";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminInvitationRedirectUrl, createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicDataClient } from "@/lib/supabase/data";

type AccessStore = { version: 1; users: Record<string, AdminAccessUser>; activity: AdminAccessAuditEntry[] };

export const ARLAR_OWNER_EMAIL = "admin@arabrheumatology.org";
const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "admin-access.json");

const owner: AdminAccessUser = {
  id: "owner",
  name: "ArLAR Administrator",
  email: ARLAR_OWNER_EMAIL,
  role: "owner",
  status: "active",
  permissions: roleDefaultPermissions.owner,
  createdAt: "2026-08-01T00:00:00.000Z",
  invitedAt: "",
  lastActiveAt: new Date().toISOString(),
  authUserId: "",
};

export function listAdminAccessUsers() {
  const store = readStore();
  return [owner, ...Object.values(store.users).filter((user) => user.email !== ARLAR_OWNER_EMAIL)]
    .toSorted((left, right) => left.role === "owner" ? -1 : right.role === "owner" ? 1 : left.name.localeCompare(right.name));
}

export async function listAdminAccessUsersAsync(): Promise<AdminAccessUser[]> {
  if (!getSupabasePublicConfig()) return listAdminAccessUsers();
  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: profiles, error: profileError }, { data: permissions, error: permissionError }] = await Promise.all([
      supabase.from("admin_profiles").select("id, auth_user_id, email, name, role, status, created_at, invited_at, last_active_at"),
      supabase.from("admin_permissions").select("admin_profile_id, module"),
    ]);
    if (profileError || permissionError || !profiles) throw profileError || permissionError || new Error("Unable to load administrator access.");
    const permissionMap = new Map<string, AdminPermission[]>();
    for (const row of permissions || []) {
      const list = permissionMap.get(row.admin_profile_id) || [];
      if (accessPermissionDefinitions.some((permission) => permission.id === row.module)) list.push(row.module as AdminPermission);
      permissionMap.set(row.admin_profile_id, list);
    }
    return profiles.map((profile) => ({
      id: profile.id,
      name: profile.name || profile.email,
      email: profile.email,
      role: profile.role,
      status: profile.status,
      permissions: profile.role === "owner" ? roleDefaultPermissions.owner : permissionMap.get(profile.id) || [],
      createdAt: profile.created_at || "",
      invitedAt: profile.invited_at || "",
      lastActiveAt: profile.last_active_at || "",
      authUserId: profile.auth_user_id || "",
    })).toSorted((left, right) => left.role === "owner" ? -1 : right.role === "owner" ? 1 : left.name.localeCompare(right.name));
  } catch (error) {
    console.error("[admin-access] Supabase read failed; using local fallback", error);
    return listAdminAccessUsers();
  }
}

export function getAdminAccessUser(id: string) {
  return listAdminAccessUsers().find((user) => user.id === id) || null;
}

export async function getAdminAccessUserAsync(id: string) {
  const users = await listAdminAccessUsersAsync();
  return users.find((user) => user.id === id) || null;
}

export function listAdminAccessActivity(limit = 20) {
  return readStore().activity.toSorted((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, limit);
}

export async function listAdminAccessActivityAsync(limit = 20) {
  if (!getSupabasePublicConfig()) return listAdminAccessActivity(limit);
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("admin_audit_log").select("id, action, entity_id, summary, metadata, created_at").eq("entity_type", "administrator").order("created_at", { ascending: false }).limit(limit);
    if (error || !data) throw error || new Error("Unable to load access activity.");
    return data.map((entry) => ({
      id: entry.id,
      action: entry.action,
      targetEmail: String(entry.metadata?.targetEmail || entry.entity_id || ""),
      detail: entry.summary || "",
      actorEmail: String(entry.metadata?.actorEmail || ARLAR_OWNER_EMAIL),
      createdAt: entry.created_at,
    }));
  } catch (error) {
    console.error("[admin-access] Supabase activity read failed; using local fallback", error);
    return listAdminAccessActivity(limit);
  }
}

export async function createAdminAccessUserAsync(input: { name: string; email: string; password: string; role: Exclude<AdminRole, "owner">; permissions: AdminPermission[] }) {
  if (!getSupabasePublicConfig()) throw new Error("Supabase must be configured before administrator accounts can be created.");
  const supabase = await createSupabaseServerClient();
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("Enter a valid email address.");
  const { data: existing } = await supabase.from("admin_profiles").select("id").eq("email", email).maybeSingle();
  if (existing) throw new Error("This email already has administrator access.");
  const admin = createSupabaseAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: text(input.name, 160), created_by: ARLAR_OWNER_EMAIL },
  });
  if (createError || !created.user) throw createError || new Error("Unable to create the Supabase Auth user.");
  const { data: profile, error } = await supabase.from("admin_profiles").insert({ auth_user_id: created.user.id, name: text(input.name, 160), email, role: input.role, status: "active", invited_at: null }).select("id, auth_user_id, email, name, role, status, created_at, invited_at, last_active_at").single();
  if (error || !profile) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw error || new Error("Unable to create administrator profile.");
  }
  const permissions = input.permissions.length ? input.permissions : roleDefaultPermissions[input.role];
  if (permissions.length) {
    const { error: permissionError } = await supabase.from("admin_permissions").insert(permissions.map((module) => ({ admin_profile_id: profile.id, module })));
    if (permissionError) {
      await admin.auth.admin.deleteUser(created.user.id);
      throw permissionError;
    }
  }
  return { id: profile.id, name: profile.name, email: profile.email, role: profile.role, status: profile.status, permissions, createdAt: profile.created_at || "", invitedAt: profile.invited_at || "", lastActiveAt: profile.last_active_at || "", authUserId: profile.auth_user_id || "" } satisfies AdminAccessUser;
}

export async function saveAdminAccessUserAsync(input: AdminAccessUser) {
  if (!getSupabasePublicConfig()) return saveAdminAccessUser(input);
  if (input.email === ARLAR_OWNER_EMAIL) throw new Error("The primary owner account cannot be changed here.");
  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase.from("admin_profiles").update({ name: text(input.name, 160), role: input.role === "owner" ? "editor" : input.role, status: input.status, updated_at: new Date().toISOString() }).eq("id", input.id).select("id").maybeSingle();
  if (error || !profile) throw error || new Error("Administrator not found.");
  const { error: deleteError } = await supabase.from("admin_permissions").delete().eq("admin_profile_id", input.id);
  if (deleteError) throw deleteError;
  const permissions = input.role === "owner" ? roleDefaultPermissions.owner : input.permissions;
  if (permissions.length) {
    const { error: permissionError } = await supabase.from("admin_permissions").insert(permissions.map((module) => ({ admin_profile_id: input.id, module })));
    if (permissionError) throw permissionError;
  }
  return { ...input, role: input.role === "owner" ? "editor" : input.role, permissions };
}

export async function renewAdminInvitationAsync(id: string) {
  if (!getSupabasePublicConfig()) return renewAdminInvitation(id);
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase.from("admin_profiles").select("id, auth_user_id, email, name, role, status, created_at, invited_at, last_active_at").eq("id", id).eq("status", "invited").maybeSingle();
  if (existingError || !existing) throw existingError || new Error("Only pending invitations can be renewed.");
  const publicClient = createSupabasePublicDataClient();
  if (!publicClient) throw new Error("Supabase is not configured.");
  const { error: resendError } = await publicClient.auth.resend({ type: "signup", email: existing.email, options: { emailRedirectTo: adminInvitationRedirectUrl() } });
  if (resendError) throw resendError;
  const invitedAt = new Date().toISOString();
  const { data, error } = await supabase.from("admin_profiles").update({ invited_at: invitedAt, updated_at: invitedAt }).eq("id", id).select("id, auth_user_id, email, name, role, status, created_at, invited_at, last_active_at").maybeSingle();
  if (error || !data) throw error || new Error("Only pending invitations can be renewed.");
  return { id: data.id, name: data.name, email: data.email, role: data.role, status: data.status, permissions: [], createdAt: data.created_at || "", invitedAt: data.invited_at || "", lastActiveAt: data.last_active_at || "", authUserId: data.auth_user_id || "" } satisfies AdminAccessUser;
}

export async function removeAdminAccessUserAsync(id: string) {
  if (!getSupabasePublicConfig()) return removeAdminAccessUser(id);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("admin_profiles").update({ status: "suspended", updated_at: new Date().toISOString() }).eq("id", id).neq("email", ARLAR_OWNER_EMAIL).select("id").maybeSingle();
  if (error || !data) throw error || new Error("Administrator not found.");
}

export function inviteAdminAccessUser(input: { name: string; email: string; role: Exclude<AdminRole, "owner">; permissions: AdminPermission[] }) {
  const store = readStore();
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("Enter a valid email address.");
  if (listAdminAccessUsers().some((user) => user.email === email)) throw new Error("This email already has access or a pending invitation.");
  const now = new Date().toISOString();
  const id = uniqueId(input.name || email, store);
  const user = sanitizeUser({
    id,
    name: input.name,
    email,
    role: input.role,
    status: "invited",
    permissions: input.permissions,
    createdAt: now,
    invitedAt: now,
    lastActiveAt: "",
    authUserId: "",
  });
  store.users[id] = user;
  addAudit(store, "Administrator invited", user.email, `${roleName(user.role)} access invitation created.`);
  writeStore(store);
  return user;
}

export function saveAdminAccessUser(input: AdminAccessUser) {
  if (input.id === owner.id || input.email === ARLAR_OWNER_EMAIL) throw new Error("The primary owner account cannot be changed here.");
  const store = readStore();
  const existing = store.users[input.id];
  if (!existing) throw new Error("Administrator not found.");
  const user = sanitizeUser({ ...existing, ...input, id: existing.id, email: existing.email, role: input.role === "owner" ? "editor" : input.role });
  store.users[user.id] = user;
  addAudit(store, "Access updated", user.email, `${roleName(user.role)} role · ${user.status} · ${user.permissions.length} permissions.`);
  writeStore(store);
  return user;
}

export function renewAdminInvitation(id: string) {
  const store = readStore();
  const user = store.users[id];
  if (!user || user.status !== "invited") throw new Error("Only pending invitations can be renewed.");
  user.invitedAt = new Date().toISOString();
  addAudit(store, "Invitation renewed", user.email, "A fresh invitation was prepared for delivery.");
  writeStore(store);
  return user;
}

export function removeAdminAccessUser(id: string) {
  if (id === owner.id) throw new Error("The primary owner account cannot be removed.");
  const store = readStore();
  const user = store.users[id];
  if (!user) throw new Error("Administrator not found.");
  delete store.users[id];
  addAudit(store, "Access removed", user.email, "Administrator access was revoked and the local record removed.");
  writeStore(store);
}

function readStore(): AccessStore {
  if (!existsSync(statePath)) return { version: 1, users: {}, activity: [] };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<AccessStore>;
    const users = parsed.users && typeof parsed.users === "object"
      ? Object.fromEntries(Object.entries(parsed.users).map(([id, user]) => [id, sanitizeUser(user)]))
      : {};
    return { version: 1, users, activity: Array.isArray(parsed.activity) ? parsed.activity.map(sanitizeAudit) : [] };
  } catch {
    return { version: 1, users: {}, activity: [] };
  }
}

function writeStore(store: AccessStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function sanitizeUser(input: AdminAccessUser): AdminAccessUser {
  const role: AdminRole = ["owner", "editor", "contributor"].includes(input.role) ? input.role : "contributor";
  const status: AdminAccessStatus = ["invited", "active", "suspended"].includes(input.status) ? input.status : "invited";
  const allowed = new Set(accessPermissionDefinitions.map((permission) => permission.id));
  const permissions = role === "owner" ? roleDefaultPermissions.owner : [...new Set((input.permissions || []).filter((permission) => allowed.has(permission)))];
  return {
    id: slug(input.id) || slug(input.email),
    name: text(input.name, 160) || "Invited administrator",
    email: normalizeEmail(input.email),
    role,
    status,
    permissions,
    createdAt: text(input.createdAt, 40),
    invitedAt: text(input.invitedAt, 40),
    lastActiveAt: text(input.lastActiveAt, 40),
    authUserId: text(input.authUserId, 160),
  };
}

function sanitizeAudit(input: AdminAccessAuditEntry): AdminAccessAuditEntry {
  return { id: text(input.id, 100), action: text(input.action, 160), targetEmail: normalizeEmail(input.targetEmail), detail: text(input.detail, 500), actorEmail: normalizeEmail(input.actorEmail) || ARLAR_OWNER_EMAIL, createdAt: text(input.createdAt, 40) };
}

function addAudit(store: AccessStore, action: string, targetEmail: string, detail: string) {
  const createdAt = new Date().toISOString();
  store.activity.push({ id: `audit-${createdAt.replace(/\D/g, "")}-${Math.random().toString(36).slice(2, 6)}`, action, targetEmail, detail, actorEmail: ARLAR_OWNER_EMAIL, createdAt });
  store.activity = store.activity.slice(-200);
  recordAdminAuditLog({ module: "access", action, entityType: "administrator", entityId: targetEmail, targetLabel: targetEmail, detail, actorEmail: ARLAR_OWNER_EMAIL, createdAt });
}

function uniqueId(value: string, store: AccessStore) { const base = slug(value) || "administrator"; let id = base; let suffix = 2; while (store.users[id] || id === owner.id) id = `${base}-${suffix++}`; return id; }
function normalizeEmail(value: unknown) { const email = text(value, 240).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ""; }
function slug(value: unknown) { return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100); }
function text(value: unknown, max: number) { return String(value || "").trim().slice(0, max); }
function roleName(role: AdminRole) { return role === "editor" ? "Editor" : role === "contributor" ? "Contributor" : "Owner"; }

// Supabase boundary: map users to auth.users + admin_profiles, permissions to admin_permissions, and activity to admin_access_audit.
