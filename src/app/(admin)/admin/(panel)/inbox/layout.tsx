import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function InboxAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("inbox");
  return children;
}
