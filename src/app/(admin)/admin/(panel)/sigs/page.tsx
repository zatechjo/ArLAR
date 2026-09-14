import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminContent, AdminPageHeader, MetricCard } from "@/components/admin/admin-ui";
import { SigDirectoryManager } from "@/components/admin/sig-directory-manager";
import { Eye, EyeOff, Users } from "lucide-react";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { getManagedSigDirectoryAsync } from "@/lib/sig-directory-repository";

export default async function AdminSigsPage() {
  const [groups, doctors] = await Promise.all([
    getManagedSigDirectoryAsync("admin").then((records) => filterDeletedAdminRecordsAsync("sigs", records.map((group) => ({ ...group, id: group.slug })))),
    listManagedDoctorsAsync().then((records) => filterDeletedAdminRecordsAsync("doctors", records)),
  ]);
  const items = groups.map((group) => {
    const path = `/special-interest-groups/${group.slug}`;
    const linkedDoctorIds = new Set(doctors.filter((doctor) => doctor.appearances.some((appearance) => appearance.path === path)).map((doctor) => doctor.id));
    return { ...group, people: linkedDoctorIds.size };
  });
  const visibleCount = items.filter((group) => group.visible).length;
  const peopleCount = items.reduce((total, group) => total + group.people, 0);

  return (
    <>
      <AdminPageHeader title="SIG directory" description="Manage group identity, visibility, and display order." actions={<AdminRecycleBinLink scope="sigs" />} />
      <AdminContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Public groups" value={visibleCount} note="Visible on the website" icon={<Eye className="h-5 w-5" />} tone="dark" />
          <MetricCard label="Hidden groups" value={items.length - visibleCount} note="Saved but not public" icon={<EyeOff className="h-5 w-5" />} tone="light" />
          <MetricCard label="Linked people" value={peopleCount} note="Across SIG profiles" icon={<Users className="h-5 w-5" />} tone="green" />
        </div>
        <div className="mt-6"><SigDirectoryManager initialItems={items} /></div>
      </AdminContent>
    </>
  );
}
