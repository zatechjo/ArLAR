import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function CongressesAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("congresses");
  return children;
}
