import { Trash2 } from "lucide-react";

import { AdminLink } from "@/components/admin/admin-ui";
import type { AdminDeletionScope } from "@/lib/admin-deletion-repository";

export function AdminRecycleBinLink({ scope, context, label = "Trash" }: { scope: AdminDeletionScope; context?: string; label?: string }) {
  const query = context ? `?context=${encodeURIComponent(context)}` : "";
  return <AdminLink href={`/admin/recycle-bin/${scope}${query}`} variant="secondary"><Trash2 size={15} />{label}</AdminLink>;
}
