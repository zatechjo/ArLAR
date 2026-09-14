import { Eye, Save } from "lucide-react";

import { Arlar27AboutIraqEditor } from "@/components/admin/arlar27-about-iraq-editor";
import { Arlar27AdminHeader } from "@/components/admin/arlar27-admin-header";
import { Arlar27StatusControl } from "@/components/admin/arlar27-status";
import { AdminContent, AdminLink } from "@/components/admin/admin-ui";
import { arlar27 } from "@/data/arlar27";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { saveArlar27AboutAction } from "@/app/(admin)/admin/(panel)/arlar27/actions";
import { getArlar27SectionStatusAsync, getManagedArlar27AboutAsync } from "@/lib/arlar27-admin-repository";

export default async function AdminArlar27AboutIraqPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const query = await searchParams;
  const [content, status] = await Promise.all([getManagedArlar27AboutAsync(arlar27.heroImage, "admin"), getArlar27SectionStatusAsync("about-iraq", "admin")]);
  return (
    <>
      <Arlar27AdminHeader
        title="About Iraq"
        description="Manage the destination story and practical planning information."
        actions={
          <>
            <Arlar27StatusControl section="about-iraq" initialStatus={status} />
            <AdminLink href="/congresses/arlar27/about-iraq" variant="secondary"><Eye size={15} />Preview</AdminLink>
            <button type="submit" form="arlar27-about-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white hover:bg-crimson-700"><Save size={15} />Save changes</button>
          </>
        }
      />
      <AdminContent>
        {query.saved === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">About Iraq content saved.</p> : null}
        <Arlar27AboutIraqEditor content={content} heroImage={content.heroImage} media={await getAdminMediaLibraryAsync()} action={saveArlar27AboutAction} formId="arlar27-about-form" />
      </AdminContent>
    </>
  );
}
