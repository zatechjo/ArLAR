import "server-only";

import type { DirectoryPerson } from "@/components/about/people-directory";
import type { Arlar27PersonPlacement } from "@/data/arlar27";
import { filterDeletedAdminRecords, filterDeletedAdminRecordsAsync, type AdminDeletionScope } from "@/lib/admin-deletion-repository";
import { listManagedDoctors, listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";

function doctorsById() { return new Map(listManagedDoctors().map((doctor) => [doctor.id, doctor])); }

export function getArlar27People(placements: readonly Arlar27PersonPlacement[], scope?: Extract<AdminDeletionScope, "arlar27-committee" | "arlar27-faculty">) {
  const visiblePlacements = scope ? filterDeletedAdminRecords(scope, [...placements]) : [...placements];
  const directory = doctorsById();
  return visiblePlacements.flatMap((placement, index): DirectoryPerson[] => {
    if (!placement.published) return [];
    const doctor = directory.get(placement.doctorId);
    if (!doctor) return [];

    return [{
      doctorId: doctor.id,
      id: placement.id,
      slug: doctor.slug,
      sortOrder: index + 1,
      group: "leadership",
      fullName: doctor.fullName,
      nameAr: doctor.nameAr, nameFr: doctor.nameFr,
      credentials: doctor.credentials,
      displayRole: placement.role,
      countryName: doctor.country,
      flagFilename: doctor.flagFilename,
      bio: doctor.biography,
      biographyAr: doctor.biographyAr, biographyFr: doctor.biographyFr,
      imageFilename: doctor.image,
      imagePosition: doctor.imagePosition,
      appearances: doctor.appearances,
    }];
  });
}

export function getArlar27Doctor(id: string) {
  return doctorsById().get(id);
}

export async function getArlar27PeopleAsync(placements: readonly Arlar27PersonPlacement[], scope?: Extract<AdminDeletionScope, "arlar27-committee" | "arlar27-faculty">) {
  const [visiblePlacements, doctors] = await Promise.all([
    scope ? filterDeletedAdminRecordsAsync(scope, [...placements]) : Promise.resolve([...placements]),
    listManagedDoctorsAsync(),
  ]);
  const directory = new Map(doctors.map((doctor) => [doctor.id, doctor]));
  return visiblePlacements.flatMap((placement, index): DirectoryPerson[] => {
    if (!placement.published) return [];
    const doctor = directory.get(placement.doctorId);
    if (!doctor) return [];
    return [{ doctorId: doctor.id, id: placement.id, slug: doctor.slug, sortOrder: index + 1, group: "leadership", fullName: doctor.fullName, nameAr: doctor.nameAr, nameFr: doctor.nameFr, credentials: doctor.credentials, displayRole: placement.role, countryName: doctor.country, flagFilename: doctor.flagFilename, bio: doctor.biography, biographyAr: doctor.biographyAr, biographyFr: doctor.biographyFr, imageFilename: doctor.image, imagePosition: doctor.imagePosition, appearances: doctor.appearances }];
  });
}

export async function getArlar27DoctorAsync(id: string) {
  return (await listManagedDoctorsAsync()).find((doctor) => doctor.id === id);
}
