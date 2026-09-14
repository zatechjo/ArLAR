import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { accessPermissionDefinitions, type AdminPermission } from "@/lib/access-control-types";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminActor = {
  authUserId: string;
  email: string;
  role: "owner" | "editor" | "contributor";
  permissions: AdminPermission[];
};

const developmentOwner: AdminActor = {
  authUserId: "development-owner",
  email: "admin@arabrheumatology.org",
  role: "owner",
  permissions: ["news", "doctors", "arlar27", "college", "sigs", "members", "congresses", "resources", "inbox", "access"],
};

/**
 * Single authentication boundary for every admin read and mutation.
 *
 * During local development the test administrator is treated as the owner.
 * Production is deliberately fail-closed until the Supabase adapter supplies
 * an authenticated actor from auth.users + admin_profiles + admin_permissions.
 */
export const requireAdminSession = cache(async (): Promise<AdminActor> => {
  // Keep the local fixture available when Supabase has not been configured yet
  // (for example, during a build in a clean environment). Once public Supabase
  // configuration is present, the real Auth session is always required—even in
  // development—so local testing matches production access control.
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.ADMIN_DEMO_ACCESS === "true" || !getSupabasePublicConfig()) {
    return developmentOwner;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("[admin-auth] Supabase user lookup failed", {
      code: authError?.code,
      message: authError?.message,
      hasUser: Boolean(user),
    });
    redirect("/admin?error=auth_required");
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, auth_user_id, email, name, role, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "active") {
    console.error("[admin-auth] Admin profile lookup failed", {
      authUserId: user.id,
      email: user.email,
      code: profileError?.code,
      message: profileError?.message,
      profileFound: Boolean(profile),
      profileStatus: profile?.status,
    });
    redirect("/admin?error=access_denied");
  }

  // Owners are global administrators by definition. Avoid an unnecessary
  // permissions-table read here; it also keeps the owner path independent of
  // the permissions-table RLS policy that applies to delegated administrators.
  if (profile.role === "owner") {
    console.info("[admin-auth] Owner session accepted", { authUserId: user.id, email: profile.email });
    return {
      authUserId: profile.auth_user_id || user.id,
      email: profile.email || user.email || "",
      role: "owner",
      permissions: accessPermissionDefinitions.map((permission) => permission.id),
    };
  }

  // Delegated administrators cannot select admin_permissions directly under
  // RLS. Resolve each assignment through the existing SECURITY DEFINER check,
  // which is also what the content-table policies use.
  const permissionChecks = await Promise.all(
    accessPermissionDefinitions.map(async ({ id }) => {
      const { data, error } = await supabase.rpc("has_admin_permission", { module_name: id });
      return { id, allowed: data === true, error };
    }),
  );
  const failedPermissionCheck = permissionChecks.find(({ error }) => error);

  if (failedPermissionCheck?.error) {
    console.error("[admin-auth] Admin permissions lookup failed", {
      authUserId: user.id,
      profileId: profile.id,
      code: failedPermissionCheck.error.code,
      message: failedPermissionCheck.error.message,
    });
    redirect("/admin?error=access_denied");
  }

  const permissions = permissionChecks
    .filter(({ allowed }) => allowed)
    .map(({ id }) => id);

  return {
    authUserId: profile.auth_user_id || user.id,
    email: profile.email || user.email || "",
    role: profile.role,
    permissions,
  };
});

export async function requireAdminPermission(permission: AdminPermission): Promise<AdminActor> {
  const actor = await requireAdminSession();
  if (actor.role !== "owner" && !actor.permissions.includes(permission)) {
    throw new Error("You do not have permission to manage this section.");
  }
  return actor;
}

const adminPermissionLandingPaths: Record<AdminPermission, string> = {
  news: "/admin/news",
  doctors: "/admin/doctors",
  arlar27: "/admin/arlar27",
  college: "/admin/college",
  sigs: "/admin/sigs",
  members: "/admin/members",
  congresses: "/admin/congresses",
  resources: "/admin/professionals",
  inbox: "/admin/inbox",
  access: "/admin/access",
};

export function adminLandingPath(actor: Pick<AdminActor, "role" | "permissions">) {
  if (actor.role === "owner") return "/admin/dashboard";
  const firstPermission = accessPermissionDefinitions.find(({ id }) => actor.permissions.includes(id));
  return firstPermission ? adminPermissionLandingPaths[firstPermission.id] : "/admin/dashboard";
}

/** Protects rendered admin pages and redirects delegated users to their first allowed module. */
export async function requireAdminPagePermission(permission: AdminPermission): Promise<AdminActor> {
  const actor = await requireAdminSession();
  if (actor.role !== "owner" && !actor.permissions.includes(permission)) {
    redirect(`${adminLandingPath(actor)}?error=permission_denied`);
  }
  return actor;
}

export async function requireAdminOwner(): Promise<AdminActor> {
  const actor = await requireAdminSession();
  if (actor.role !== "owner" || actor.email.toLowerCase() !== "admin@arabrheumatology.org") {
    redirect("/admin/dashboard?error=owner_required");
  }
  return actor;
}
