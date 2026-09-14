import { ExternalLink, Save } from "lucide-react";
import { notFound } from "next/navigation";

import { saveMemberCountryAction } from "@/app/(admin)/admin/(panel)/members/actions";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminContent, AdminLink, AdminPageHeader } from "@/components/admin/admin-ui";
import { MemberCountryEditor } from "@/components/admin/member-country-editor";
import { filterDeletedAdminRecordsAsync, isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { getManagedMemberCountryAsync } from "@/lib/member-societies-repository";

export default async function MemberCountryPage({ params, searchParams }: PageProps<"/admin/members/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [source, deleted] = await Promise.all([getManagedMemberCountryAsync(slug), isAdminRecordDeletedAsync("member-countries", slug)]);
  if (!source || deleted) notFound();
  const country = { ...source, societies: await filterDeletedAdminRecordsAsync("member-societies", source.societies) };
  const action = saveMemberCountryAction.bind(null, slug);

  return (
    <>
      <AdminPageHeader title={country.country} description="Manage the country card and its national societies." actions={<><AdminRecycleBinLink scope="member-societies" label="Societies trash" /><AdminLink href={`/members#${country.slug}`} variant="secondary"><ExternalLink size={15} />Public card</AdminLink><button type="submit" form="member-country-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:border-crimson-700 hover:bg-crimson-700"><Save size={15} />Save changes</button></>} />
      <AdminContent className="max-w-[1400px]">
        {query.saved === "1" ? <div className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Member country saved.</div> : null}
        <MemberCountryEditor country={country} media={await getAdminMediaLibraryAsync()} action={action} />
      </AdminContent>
    </>
  );
}
