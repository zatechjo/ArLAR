import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function LeadershipAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("doctors");
  return children;
}
