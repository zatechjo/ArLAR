import { createStaticPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

import { AaaaGroupTabs } from "@/components/special-interest-groups/aaaa-group-tabs";
import { PageHero } from "@/components/page-hero";
import type { DirectoryPerson } from "@/components/about/people-directory";
import aaaaData from "@/data/aaaa-group.json";
import aaaaArchive from "@/data/aaaa-video-library.json";
import type { DoctorAppearance, DoctorRecord } from "@/data/doctor-types";
import { findManagedDoctorByName } from "@/lib/admin-doctor-repository";
import { isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { listAssignedDoctorsAsync } from "@/lib/doctor-placement-repository";
import { getManagedSigAsync } from "@/lib/sig-directory-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/special-interest-groups/arab-adult-arthritis-awareness");

type AaaaPerson = (typeof aaaaData.board)[number] | (typeof aaaaData.members)[number];

function toDirectoryPerson(
  doctor: DoctorRecord,
  placement: DoctorAppearance,
  person: AaaaPerson | undefined,
  index: number,
  leadership: boolean,
): DirectoryPerson {
  const localImage = person?.profileImage.localPath
    .replace(/^public[\\/]/, "/")
    .replaceAll("\\", "/");

  return {
    doctorId: doctor.id,
    id: doctor.id,
    slug: doctor.slug,
    sortOrder: index + 1,
    group: leadership ? "leadership" : "members",
    fullName: doctor.fullName,
    nameAr: doctor.nameAr, nameFr: doctor.nameFr,
    credentials: doctor.credentials,
    displayRole: placement.role || person?.groupRole || (leadership ? "Group Board Member" : "AAAA Group Member"),
    countryName: doctor.country,
    flagFilename: doctor.flagFilename,
    bio: doctor.biography,
    biographyAr: doctor.biographyAr, biographyFr: doctor.biographyFr,
    imageFilename: doctor.image || localImage || "/images/college-members/profile-placeholder.jpg",
    imagePosition: doctor.imagePosition,
    appearances: doctor.appearances,
  };
}

export default async function ArabAdultArthritisAwarenessPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const [group, deleted, managedAaaa, managedArchive, assignedDoctors] = await Promise.all([
    getManagedSigAsync("arab-adult-arthritis-awareness"), isAdminRecordDeletedAsync("sigs", "arab-adult-arthritis-awareness"),
    getPublishedSiteContent("sigs", "arab-adult-arthritis-awareness", aaaaData),
    getPublishedSiteContent("education", "aaaa-video-library", aaaaArchive), listAssignedDoctorsAsync("sig-aaaa"),
  ]);
  if (!group?.visible || deleted) notFound();
  const sourcePeople = [...managedAaaa.board, ...managedAaaa.members];
  const toPerson = ({ doctor, placement }: (typeof assignedDoctors)[number], index: number) =>
    toDirectoryPerson(
      doctor,
      placement,
      sourcePeople.find((candidate) => findManagedDoctorByName([doctor], candidate.name)),
      index,
      placement.section.toLowerCase().includes("board"),
    );
  const boardPeople = assignedDoctors.filter(({ placement }) => placement.section.toLowerCase().includes("board")).map(toPerson);
  const memberPeople = assignedDoctors.filter(({ placement }) => !placement.section.toLowerCase().includes("board")).map(toPerson);
  return (
    <main>
      <PageHero
        breadcrumbs={[
          {
            label: "Special Interest Groups",
            href: "/special-interest-groups",
          },
        ]}
        title={group.name}
        description={"Supporting public and patient education about rheumatic diseases across the Arab world."}
        grainId="aaaa-group-hero-grain"
        heroLogo={{ src: group.logo, alt: `${t(group.name)} ${t("logo")}`, frame: "square" }}
        compactTitle
      />

      <section className="relative overflow-hidden bg-[#f5f8f7] py-10 lg:py-12">
        <div
          aria-hidden
          className="absolute -left-40 top-24 size-80 rounded-full bg-crimson-50 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-40 bottom-28 size-80 rounded-full bg-jade-50 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <AaaaGroupTabs boardPeople={boardPeople} memberPeople={memberPeople} data={managedAaaa} archiveData={managedArchive} />
        </div>
      </section>
    </main>
  );
}
