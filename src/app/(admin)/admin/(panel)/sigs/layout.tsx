import { requireAdminPagePermission } from "@/lib/admin-authorization";

export default async function SigsAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPagePermission("sigs");
  return children;
}
