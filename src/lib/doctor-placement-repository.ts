import "server-only";

import type { DoctorAppearance, DoctorRecord } from "@/data/doctor-types";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";

export type AssignedDoctor = {
  doctor: DoctorRecord;
  placement: DoctorAppearance;
};

/** Public rosters are driven by the placements saved in the doctor editor. */
export async function listAssignedDoctorsAsync(pageId: string): Promise<AssignedDoctor[]> {
  const doctors = await filterDeletedAdminRecordsAsync(
    "doctors",
    await listManagedDoctorsAsync(),
  );

  const assigned = doctors.flatMap((doctor) =>
    doctor.appearances
      .filter((placement) => placement.pageId === pageId)
      .map((placement) => ({ doctor, placement })),
  );
  return assigned.toSorted((a, b) => {
    const sectionOrder = a.placement.section.localeCompare(b.placement.section);
    if (sectionOrder) return sectionOrder;
    const aSaved = a.placement.sortOrderVersion === 1 && Number.isFinite(a.placement.sortOrder);
    const bSaved = b.placement.sortOrderVersion === 1 && Number.isFinite(b.placement.sortOrder);
    if (aSaved !== bSaved) return aSaved ? -1 : 1;
    return (aSaved ? (a.placement.sortOrder ?? 0) - (b.placement.sortOrder ?? 0) : 0)
      || a.doctor.fullName.localeCompare(b.doctor.fullName);
  });
}
