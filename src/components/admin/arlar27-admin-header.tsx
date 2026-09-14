import type { ReactNode } from "react";

import { Arlar27AdminNav } from "@/components/admin/arlar27-admin-nav";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export function Arlar27AdminHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <>
      <AdminPageHeader title={title} description={description} actions={actions} />
      <Arlar27AdminNav />
    </>
  );
}
