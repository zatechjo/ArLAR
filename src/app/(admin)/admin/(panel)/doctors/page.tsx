import { AdminContent, AdminLink, AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { DoctorsManager } from "@/components/admin/doctors-manager";
import { Users } from "@/components/icons";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";

export default async function AdminDoctorsPage() {
  const doctors = (await filterDeletedAdminRecordsAsync("doctors", await listManagedDoctorsAsync())).map((doctor) => ({ id: doctor.id, fullName: doctor.fullName, name: doctor.name, credentials: doctor.credentials, country: doctor.country, flagFilename: doctor.flagFilename, image: doctor.image, imagePosition: doctor.imagePosition, biography: doctor.biography, nameAr: doctor.nameAr ?? "", nameFr: doctor.nameFr ?? "", biographyAr: doctor.biographyAr ?? [], biographyFr: doctor.biographyFr ?? [], sourceFullNames: doctor.sourceFullNames, appearances: doctor.appearances }));
  return <><AdminPageHeader eyebrow="People database" title="Doctor directory" description="One identity per doctor. Update a profile here and every board, committee, SIG, College, and congress placement stays consistent." actions={<><AdminRecycleBinLink scope="doctors" /><AdminLink href="/admin/doctors/new"><Users className="h-4 w-4" />Add doctor</AdminLink></>} /><AdminContent><DoctorsManager doctors={doctors} /></AdminContent></>;
}
