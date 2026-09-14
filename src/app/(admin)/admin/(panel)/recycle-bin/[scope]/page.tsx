import { notFound } from "next/navigation";

import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { RecycleBinManager } from "@/components/admin/recycle-bin-manager";
import { isAdminDeletionScope, recycleBinConfig } from "@/lib/admin-trash-catalog";
import { getAdminTrashItemsAsync } from "@/lib/admin-trash-catalog-async";
import { requireAdminPagePermission } from "@/lib/admin-authorization";
import type { AdminPermission } from "@/lib/access-control-types";

export default async function AdminRecycleBinPage({ params, searchParams }: PageProps<"/admin/recycle-bin/[scope]">) {
  const [{ scope }, query] = await Promise.all([params, searchParams]);
  if (!isAdminDeletionScope(scope)) notFound();
  await requireAdminPagePermission(permissionForScope(scope));
  const context = typeof query.context === "string" ? query.context : undefined;
  const config = recycleBinConfig[scope];
  const items = await getAdminTrashItemsAsync(scope, context);

  return (
    <>
      <AdminPageHeader
        title={config.title}
        description={config.description}
      />
      <AdminContent><RecycleBinManager scope={scope} initialItems={items} /></AdminContent>
    </>
  );
}

function permissionForScope(scope: keyof typeof recycleBinConfig): AdminPermission {
  if (scope === "doctors") return "doctors";
  if (scope === "college-events") return "college";
  if (scope === "congresses" || scope === "congress-replays") return "congresses";
  if (scope === "sigs") return "sigs";
  if (scope === "professional-resources") return "resources";
  if (scope === "member-countries" || scope === "member-societies") return "members";
  return "arlar27";
}
