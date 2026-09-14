import { createStaticPageMetadata } from "@/lib/seo";

import { AboutDirectoryHero } from "@/components/about/about-directory-hero";
import {
  PeopleDirectory,
  type DirectoryPerson,
} from "@/components/about/people-directory";
import committeeData from "@/data/scientific-committee.json";
import { findManagedDoctorByName } from "@/lib/admin-doctor-repository";
import { listAssignedDoctorsAsync } from "@/lib/doctor-placement-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export const generateMetadata = createStaticPageMetadata("/about/scientific-committee");

export default async function ScientificCommitteePage() {
  const [managedCommittee, assignedDoctors] = await Promise.all([
    getPublishedSiteContent("people", "scientific-committee", committeeData),
    listAssignedDoctorsAsync("scientific-committee"),
  ]);
  const sourcePeople = managedCommittee.people;
  const people = assignedDoctors.map(
    ({ doctor, placement }, index): DirectoryPerson => {
      const person = sourcePeople.find((candidate) => findManagedDoctorByName([doctor], candidate.fullName));
      return {
        ...person,
        doctorId: doctor.id,
        id: doctor.id,
        slug: doctor.slug,
        sortOrder: person?.sortOrder ?? sourcePeople.length + index + 1,
        group: (person?.group as DirectoryPerson["group"] | undefined) ?? (placement.role.toLowerCase().includes("president") ? "leadership" : "members"),
        fullName: doctor.fullName,
        nameAr: doctor.nameAr, nameFr: doctor.nameFr,
        credentials: doctor.credentials,
        displayRole: placement.role || person?.displayRole || "Scientific Committee Member",
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
      <AboutDirectoryHero
        currentPage="Scientific Committee"
        title="Scientific Committee"
        description="Regional experts shaping ArLAR’s scientific agenda, educational direction, and pursuit of excellence in rheumatology."
        grainId="scientific-committee-hero-grain"
      />

      <PeopleDirectory
        people={people}
        imageDirectory="/images/scientific-committee"
        eyebrow="Scientific Committee"
        title="Expertise from across the Arab world."
        description="The committee brings together its president and regional members, combining clinical leadership, academic experience, and diverse perspectives to advance rheumatology research and education."
      />
    </main>
  );
}
