import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function NewsAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("news");
  return children;
}
