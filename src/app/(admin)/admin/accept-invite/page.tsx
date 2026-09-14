import type { Metadata } from "next";

import { AdminInviteAcceptance } from "@/components/admin/admin-invite-acceptance";

export const metadata: Metadata = {
  title: "Accept administrator invitation",
  robots: { index: false, follow: false },
};

export default function AcceptAdminInvitationPage() {
  return <AdminInviteAcceptance />;
}
