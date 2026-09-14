import { Plus } from "lucide-react";

import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminContent, AdminLink, AdminPageHeader, MetricCard } from "@/components/admin/admin-ui";
import { MemberDirectoryManager } from "@/components/admin/member-directory-manager";
import { ExternalLink, Globe, Users } from "@/components/icons";
import { filterDeletedAdminRecordsAsync, getDeletedAdminRecordIdsAsync } from "@/lib/admin-deletion-repository";
import { getManagedMemberCountriesAsync } from "@/lib/member-societies-repository";

export default async function AdminMembersPage() {
  const [managedCountries, deletedSocieties] = await Promise.all([getManagedMemberCountriesAsync(), getDeletedAdminRecordIdsAsync("member-societies")]);
  const countries = await filterDeletedAdminRecordsAsync("member-countries", managedCountries.map((country) => ({ ...country, id: country.slug })));
  const items = countries.map((country) => {
    const societies = country.societies.filter((society) => !deletedSocieties.has(society.id));
    return {
      slug: country.slug,
      country: country.country,
      countryCode: country.countryCode,
      flagSrc: /^https?:\/\//i.test(country.flag) || country.flag.startsWith("/")
        ? country.flag
        : `/Arab Flags/${country.flag}`,
      societies: societies.length,
      websites: societies.filter((society) => society.websiteUrl).length,
      socialLinks: societies.reduce((sum, society) => sum + society.socials.length, 0),
    };
  });
  const societyCount = items.reduce((sum, country) => sum + country.societies, 0);
  const websiteCount = items.reduce((sum, country) => sum + country.websites, 0);

  return (
    <>
      <AdminPageHeader title="Member societies" description="Manage member countries and national societies." actions={<><AdminRecycleBinLink scope="member-countries" label="Countries trash" /><AdminRecycleBinLink scope="member-societies" label="Societies trash" /><AdminLink href="/admin/members/new"><Plus size={15} />Add country</AdminLink></>} />
      <AdminContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Member countries" value={items.length} note="Across the Arab region" icon={<Globe className="h-5 w-5" />} tone="dark" />
          <MetricCard label="National societies" value={societyCount} note="Active public organisations" icon={<Users className="h-5 w-5" />} tone="light" />
          <MetricCard label="Society websites" value={websiteCount} note="Linked from the directory" icon={<ExternalLink className="h-5 w-5" />} tone="green" />
        </div>
        <div className="mt-6"><MemberDirectoryManager initialItems={items} /></div>
      </AdminContent>
    </>
  );
}
