import { ShieldCheck, UserCheck, UserPlus } from "lucide-react";

import { AccessManager } from "@/components/admin/access-manager";
import { AdminContent, AdminPageHeader, MetricCard } from "@/components/admin/admin-ui";
import { listAdminAccessActivityAsync, listAdminAccessUsersAsync } from "@/lib/access-control-repository";
import { requireAdminOwner } from "@/lib/admin-authorization";

export default async function AccessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminOwner();
  const query = await searchParams;
  const users = await listAdminAccessUsersAsync();
  const active = users.filter((user) => user.status === "active").length;
  const invited = users.filter((user) => user.status === "invited").length;
  return <><AdminPageHeader title="Access control" description="Manage administrator access and permissions." /><AdminContent>{query.removed === "1" ? <div className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Administrator access removed.</div> : null}<div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Administrator accounts" value={users.length} note="Including the protected owner" icon={<ShieldCheck className="size-5" />} tone="dark" /><MetricCard label="Active access" value={active} note="Accounts currently enabled" icon={<UserCheck className="size-5" />} tone="green" /><MetricCard label="Pending invitations" value={invited} note="Awaiting account activation" icon={<UserPlus className="size-5" />} tone="light" /></div><div className="mt-6"><AccessManager users={users} activity={await listAdminAccessActivityAsync()} /></div></AdminContent></>;
}
