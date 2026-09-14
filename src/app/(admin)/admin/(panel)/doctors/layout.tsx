import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function DoctorsAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("doctors");
  return children;
}
