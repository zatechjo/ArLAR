import { ExternalLink, Save } from "lucide-react";

import { Arlar27AdminHeader } from "@/components/admin/arlar27-admin-header";
import { Arlar27StatusControl } from "@/components/admin/arlar27-status";
import { Arlar27ExternalRedirectEditor } from "@/components/admin/arlar27-external-redirect-editor";
import { AdminContent, AdminLink } from "@/components/admin/admin-ui";
import { saveArlar27ExternalAction } from "@/app/(admin)/admin/(panel)/arlar27/actions";
import { getArlar27SectionStatusAsync, getManagedArlar27ExternalAsync } from "@/lib/arlar27-admin-repository";

export default async function AdminArlar27RegistrationPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const query = await searchParams;
  const [destination, status] = await Promise.all([getManagedArlar27ExternalAsync("registration", "admin"), getArlar27SectionStatusAsync("registration", "admin")]);
  const action = saveArlar27ExternalAction.bind(null, "registration", destination.label);
  return (
    <>
      <Arlar27AdminHeader
        title="Registration"
        description="Connect the public page to the official registration portal."
        actions={
          <>
            <Arlar27StatusControl section="registration" initialStatus={status} />
            <AdminLink href="/congresses/arlar27/registration" variant="secondary"><ExternalLink size={15} />Public route</AdminLink>
            <button type="submit" form="arlar27-registration-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white hover:bg-crimson-700"><Save size={15} />Save destination</button>
          </>
        }
      />
      <AdminContent>
        {query.saved === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Registration destination saved.</p> : null}
        <Arlar27ExternalRedirectEditor label={destination.label} publicPath="/congresses/arlar27/registration" initialUrl={destination.url} initialEnabled={destination.enabled} action={action} formId="arlar27-registration-form" />
      </AdminContent>
    </>
  );
}
