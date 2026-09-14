import { createStaticPageMetadata } from "@/lib/seo";

import { AboutDirectoryHero } from "@/components/about/about-directory-hero";
import {
  PeopleDirectory,
  type DirectoryPerson,
} from "@/components/about/people-directory";
import mediaData from "@/data/media-group.json";
import { findManagedDoctorByName, listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export const generateMetadata = createStaticPageMetadata("/about/media-group");

export default async function MediaGroupPage() {
  const [managedMedia, allDoctors] = await Promise.all([getPublishedSiteContent("people", "media-group", mediaData), listManagedDoctorsAsync()]);
  const doctors = await filterDeletedAdminRecordsAsync("doctors", allDoctors);
  const sourcePeople = managedMedia.people;
  const assignedDoctors = doctors.filter((doctor) => doctor.appearances.some((appearance) => appearance.pageId === "media-group"));
  const people = assignedDoctors.map(
    (doctor, index): DirectoryPerson => {
      const person = sourcePeople.find((candidate) => findManagedDoctorByName([doctor], candidate.fullName));
      const placement = doctor.appearances.find((appearance) => appearance.pageId === "media-group");
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
        displayRole: placement?.role || person?.displayRole || "Media Group Member",
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
        currentPage="ArLAR Media Group"
        title="ArLAR Media Group"
        description="A regional network helping ArLAR share knowledge, strengthen awareness, and keep the rheumatology community connected."
        grainId="media-group-hero-grain"
      />

      <PeopleDirectory
        people={people}
        imageDirectory="/images/media-group"
        eyebrow="ArLAR Media Group"
        title="Many voices. One regional connection."
        description="The chair and Media Group members work together to connect societies and clinicians across the Arab world through professional communication, scientific outreach, and community awareness."
      />

    </main>
  );
}
