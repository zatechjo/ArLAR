"use server";

import { revalidatePath } from "next/cache";

import { updateInboxRecordStatusAsync, type InboxRecordStatus } from "@/lib/inbox-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";

export async function updateInboxStatusAction(id: string, status: InboxRecordStatus) {
  const actor = await requireAdminPermission("inbox");
  const allowed: InboxRecordStatus[] = ["unread", "read", "resolved", "archived", "active", "unsubscribed"];
  if (!allowed.includes(status)) throw new Error("Unsupported inbox status.");
  await updateInboxRecordStatusAsync(id, status);
  await recordAdminAuditLogAsync({ module: "inbox", action: "Inbox status updated", entityType: "inbox-record", entityId: id, targetLabel: id, detail: `Inbox record marked ${status}.`, actorEmail: actor.email });
  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${id}`);
}
