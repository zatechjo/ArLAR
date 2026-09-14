import { ClipboardList } from "lucide-react";
import { AdminAuditLog } from "@/components/admin/admin-audit-log";
import { AdminContent, AdminPageHeader, MetricCard } from "@/components/admin/admin-ui";
import { requireAdminOwner } from "@/lib/admin-authorization";
import { listAdminAuditLogAsync } from "@/lib/admin-audit-repository";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  await requireAdminOwner();
  const entries = await listAdminAuditLogAsync(500);
  const actors = new Set(entries.map((entry) => entry.actorEmail).filter(Boolean));
  return <><AdminPageHeader title="Activity log" description="Owner-only audit trail for administrator and content activity." /><AdminContent><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Recorded events" value={entries.length} note="Most recent 500 shown" icon={<ClipboardList className="size-5" />} tone="dark" /><MetricCard label="Actors" value={actors.size} note="Administrators represented" icon={<ClipboardList className="size-5" />} tone="light" /><MetricCard label="Storage policy" value="Metadata" note="No file contents stored" icon={<ClipboardList className="size-5" />} tone="green" /></div><div className="mt-6"><AdminAuditLog entries={entries} /></div></AdminContent></>;
}
