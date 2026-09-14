import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function ProfessionalsAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("resources");
  return children;
}
