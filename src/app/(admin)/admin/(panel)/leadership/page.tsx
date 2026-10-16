import { ExternalLink } from "lucide-react";

import { LeadershipDoctorPicker } from "@/components/admin/leadership-doctor-picker";
import { LeadershipPeopleManager } from "@/components/admin/leadership-people-manager";
import { AdminContent, AdminLink, AdminPageHeader, SectionCard } from "@/components/admin/admin-ui";
import boardData from "@/data/board-members.json";
import mediaData from "@/data/media-group.json";
import scientificData from "@/data/scientific-committee.json";
import type { DoctorAppearance, DoctorRecord } from "@/data/doctor-types";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { findManagedDoctorByName, listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";

type LinkedDoctor = { doctor: DoctorRecord; appearance: DoctorAppearance };
type SourcePerson = { fullName: string; sortOrder: number };

const boardSections = ["Executive Council", "Board Members"];
const scientificSections = ["Scientific Committee"];
const mediaSections = ["Media Group"];

export default async function AdminLeadershipPage() {
  const doctors = await filterDeletedAdminRecordsAsync("doctors", await listManagedDoctorsAsync());
  const directoryDoctors = doctors.map((doctor) => ({ id: doctor.id, fullName: doctor.fullName, country: doctor.country, image: doctor.image, imagePosition: doctor.imagePosition }));
  const boardPeople = buildRoster(doctors, "board-of-directors", boardSections, boardData.people as SourcePerson[]);
  const scientificPeople = buildRoster(doctors, "scientific-committee", scientificSections, scientificData.people as SourcePerson[]);
  const mediaPeople = buildRoster(doctors, "media-group", mediaSections, mediaData.people as SourcePerson[]);

  return (
    <>
      <AdminPageHeader
        eyebrow="People database"
        title="ArLAR leadership"
        description="Manage the doctors and public display order for the Board of Directors, Scientific Committee, and Media Group."
        actions={<><AdminLink href="/about/board" variant="secondary"><ExternalLink size={15} />Board</AdminLink><AdminLink href="/about/scientific-committee" variant="secondary"><ExternalLink size={15} />Scientific</AdminLink><AdminLink href="/about/media-group" variant="secondary"><ExternalLink size={15} />Media</AdminLink></>}
      />
      <AdminContent className="max-w-[1300px] space-y-6">
        <SectionCard
          title="Board of Directors"
          description="Drag doctors into the public website order within each board section, then save."
          action={<LeadershipDoctorPicker pageId="board-of-directors" pageTitle="Board of Directors" doctors={directoryDoctors} linkedDoctorIds={[...new Set(boardPeople.map(({ doctor }) => doctor.id))]} sections={boardSections} defaultRoles={{ "Executive Council": "Executive Council Member", "Board Members": "Board Member" }} />}
        >
          <LeadershipPeopleManager key={rosterKey(boardPeople)} pageId="board-of-directors" sections={boardSections} initialPeople={toManagerPeople(boardPeople)} />
        </SectionCard>

        <SectionCard
          title="Scientific Committee"
          description="Manage the committee roster and the order shown on its public page."
          action={<LeadershipDoctorPicker pageId="scientific-committee" pageTitle="Scientific Committee" doctors={directoryDoctors} linkedDoctorIds={[...new Set(scientificPeople.map(({ doctor }) => doctor.id))]} sections={scientificSections} defaultRoles={{ "Scientific Committee": "Scientific Committee Member" }} />}
        >
          <LeadershipPeopleManager key={rosterKey(scientificPeople)} pageId="scientific-committee" sections={scientificSections} initialPeople={toManagerPeople(scientificPeople)} />
        </SectionCard>

        <SectionCard
          title="ArLAR Media Group"
          description="Manage the Media Group roster and the order shown on its public page."
          action={<LeadershipDoctorPicker pageId="media-group" pageTitle="ArLAR Media Group" doctors={directoryDoctors} linkedDoctorIds={[...new Set(mediaPeople.map(({ doctor }) => doctor.id))]} sections={mediaSections} defaultRoles={{ "Media Group": "Media Group Member" }} />}
        >
          <LeadershipPeopleManager key={rosterKey(mediaPeople)} pageId="media-group" sections={mediaSections} initialPeople={toManagerPeople(mediaPeople)} />
        </SectionCard>
      </AdminContent>
    </>
  );
}

function buildRoster(doctors: DoctorRecord[], pageId: string, sections: string[], sourcePeople: SourcePerson[]) {
  const linked = doctors.flatMap((doctor) => doctor.appearances
    .filter((appearance) => appearance.pageId === pageId)
    .map((appearance) => ({ doctor, appearance })));
  const sourceOrder = new Map<string, number>();
  for (const { doctor } of linked) {
    const source = sourcePeople.find((person) => findManagedDoctorByName([doctor], person.fullName));
    sourceOrder.set(doctor.id, source?.sortOrder ?? Number.MAX_SAFE_INTEGER);
  }

  const result: Array<LinkedDoctor & { displayOrder: number }> = [];
  for (const section of sections) {
    const sectionPeople = linked.filter(({ appearance }) => appearance.section === section);
    const hasCompleteSavedOrder = sectionPeople.length > 0 && sectionPeople.every(({ appearance }) => appearance.sortOrderVersion === 1 && Number.isFinite(appearance.sortOrder));
    const ordered = sectionPeople.toSorted((a, b) => (
      hasCompleteSavedOrder
        ? (a.appearance.sortOrder ?? 0) - (b.appearance.sortOrder ?? 0)
        : (sourceOrder.get(a.doctor.id) ?? Number.MAX_SAFE_INTEGER) - (sourceOrder.get(b.doctor.id) ?? Number.MAX_SAFE_INTEGER)
    ) || a.doctor.fullName.localeCompare(b.doctor.fullName));
    ordered.forEach((person, index) => result.push({ ...person, displayOrder: index + 1 }));
  }
  return result;
}

function toManagerPeople(people: Array<LinkedDoctor & { displayOrder: number }>) {
  return people.map(({ doctor, appearance, displayOrder }) => ({
    doctorId: doctor.id,
    appearanceId: appearance.id,
    fullName: doctor.fullName,
    country: doctor.country,
    credentials: doctor.credentials,
    image: doctor.image,
    imagePosition: doctor.imagePosition,
    role: appearance.role,
    section: appearance.section,
    sortOrder: displayOrder,
  }));
}

function rosterKey(people: Array<LinkedDoctor & { displayOrder: number }>) {
  return people.map(({ doctor, appearance, displayOrder }) => `${doctor.id}:${appearance.id}:${displayOrder}`).join("|");
}
