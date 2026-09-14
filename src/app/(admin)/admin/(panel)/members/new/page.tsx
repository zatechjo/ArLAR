import { Save } from "lucide-react";

import { saveMemberCountryAction } from "@/app/(admin)/admin/(panel)/members/actions";
import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { MemberCountryEditor } from "@/components/admin/member-country-editor";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";

const emptyCountry = { country: "", countryCode: "", slug: "new", flag: "", background: "", backgroundCredit: "", societies: [] };

export default async function NewMemberCountryPage() {
  const action = saveMemberCountryAction.bind(null, "new");
  return (
    <>
      <AdminPageHeader title="Add member country" description="Create a country and add its national societies." actions={<button type="submit" form="member-country-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:bg-crimson-700"><Save size={15} />Create country</button>} />
      <AdminContent className="max-w-[1400px]"><MemberCountryEditor country={emptyCountry} media={await getAdminMediaLibraryAsync()} action={action} /></AdminContent>
    </>
  );
}
