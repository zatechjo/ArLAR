import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function Arlar27AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("arlar27");
  return children;
}
