import { createStaticPageMetadata } from "@/lib/seo";

import { PageHero } from "@/components/page-hero";
import {
  PeopleDirectory,
  type DirectoryPerson,
} from "@/components/about/people-directory";
import collegeData from "@/data/college-members.json";
import { findManagedDoctorByName } from "@/lib/admin-doctor-repository";
import { listAssignedDoctorsAsync } from "@/lib/doctor-placement-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export const generateMetadata = createStaticPageMetadata("/college/members");

export default async function CollegeMembersPage() {
  const [managedCollege, assignedDoctors] = await Promise.all([
    getPublishedSiteContent("people", "college-members", collegeData),
    listAssignedDoctorsAsync("arlar-college-members"),
  ]);
  const sourcePeople = managedCollege.people;
  const people = assignedDoctors.map(
    ({ doctor, placement }, index): DirectoryPerson => {
      const person = sourcePeople.find((candidate) => findManagedDoctorByName([doctor], candidate.fullName));
      return {
        ...person,
        doctorId: doctor.id,
        id: doctor.id,
        slug: doctor.slug,
        sortOrder: person?.sortOrder ?? sourcePeople.length + index + 1,
        group: (person?.group as DirectoryPerson["group"] | undefined) ?? "members",
        fullName: doctor.fullName,
        nameAr: doctor.nameAr, nameFr: doctor.nameFr,
        credentials: doctor.credentials,
        displayRole: placement.role || person?.displayRole || "ArLAR College Member",
        countryName: doctor.country,
        flagFilename: doctor.flagFilename,
        bio: doctor.biography,
        biographyAr: doctor.biographyAr, biographyFr: doctor.biographyFr,
        imageFilename: doctor.image,
        imagePosition: doctor.imagePosition,
        appearances: doctor.appearances,
      };
    },
  )
  .sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "ArLAR College", href: "/college/about" },
          { label: "ArLAR College Members" },
        ]}
        title="ArLAR College Members"
        description="The rheumatologists who make up the College, from across the Arab world."
        grainId="college-members-hero-grain"
      />

      <PeopleDirectory
        people={people}
        imageDirectory="/images/college-members"
        countLabel="College members"
        eyebrow="ArLAR College Members"
        title="Expert Arab rheumatologists, working together."
        description="College members gather the expertise of rheumatologists from across the region, collaborating with the international rheumatology community on education, awareness, and research."
      />
    </main>
  );
}
