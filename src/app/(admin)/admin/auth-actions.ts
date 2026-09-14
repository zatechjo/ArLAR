"use server";

import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { requireAdminSession } from "@/lib/admin-authorization";

async function recordAuthenticationEvent(action: "Signed in" | "Signed out") {
  const actor = await requireAdminSession();
  await recordAdminAuditLogAsync({
    module: "authentication",
    action,
    entityType: "admin-session",
    entityId: actor.authUserId,
    targetLabel: actor.email,
    detail: `${actor.email} ${action.toLowerCase()} of the ArLAR administration portal.`,
    actorEmail: actor.email,
  });
}

export async function recordAdminSignInAction() {
  await recordAuthenticationEvent("Signed in");
}

export async function recordAdminSignOutAction() {
  await recordAuthenticationEvent("Signed out");
}
