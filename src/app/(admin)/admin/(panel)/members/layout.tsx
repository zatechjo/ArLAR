import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function MembersAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("members");
  return children;
}
