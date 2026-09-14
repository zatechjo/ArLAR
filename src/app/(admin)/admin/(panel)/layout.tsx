import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireAdminSession();
  return <AdminShell isOwner={actor.role === "owner" && actor.email.toLowerCase() === "admin@arabrheumatology.org"} actor={{ email: actor.email, name: actor.role === "owner" ? "ArLAR Administrator" : actor.email.split("@")[0], permissions: actor.permissions }}>{children}</AdminShell>;
}
