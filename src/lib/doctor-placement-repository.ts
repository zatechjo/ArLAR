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
  const sectionsWithCompleteOrder = new Set([...new Set(assigned.map(({ placement }) => placement.section))]
    .filter((section) => assigned.filter(({ placement }) => placement.section === section)
      .every(({ placement }) => placement.sortOrderVersion === 1 && Number.isFinite(placement.sortOrder))));
  return assigned.toSorted((a, b) =>
    a.placement.section.localeCompare(b.placement.section)
    || (sectionsWithCompleteOrder.has(a.placement.section) ? (a.placement.sortOrder ?? 0) - (b.placement.sortOrder ?? 0) : 0)
    || a.doctor.fullName.localeCompare(b.doctor.fullName),
  );
}
