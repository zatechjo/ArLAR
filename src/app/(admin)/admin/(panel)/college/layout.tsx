import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function CollegeAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("college");
  return children;
}
