import "server-only";

import aaaaData from "@/data/aaaa-group.json";
import boardData from "@/data/board-members.json";
import collegeData from "@/data/college-members.json";
import doctorArabicData from "@/data/doctor-arabic.json";
import doctorFrenchData from "@/data/doctor-french.json";
import mediaData from "@/data/media-group.json";
import scientificData from "@/data/scientific-committee.json";
import { sigProfiles, type SigPerson, type SigProfile } from "@/data/sig-profiles";
import type { DoctorAppearance, DoctorRecord } from "@/data/doctor-types";
import { isAdminRecordDeleted } from "@/lib/admin-deletion-repository";
import { formatDoctorName } from "@/lib/doctor-name";

export const countryFlags: Record<string, string> = {
  Algeria: "dz-algeria.png",
  Bahrain: "bahrain.png",
  Egypt: "eg-egypt.png",
  Iraq: "iq-iraq.png",
  Jordan: "jo-jordan.png",
  Kuwait: "kw-kuwait.png",
  Lebanon: "lb-lebanon.png",
  Libya: "ly-libya.png",
  Morocco: "ma-morocco.png",
  Oman: "om-oman.png",
  Palestine: "ps-palestine.png",
  Qatar: "qa-qatar.png",
  "Saudi Arabia": "sa-saudi-arabia.png",
  Sudan: "sd-sudan.png",
  Syria: "sy-syria.webp",
  Tunisia: "tn-tunisia.png",
  "United Arab Emirates": "ae-united-arab-emirates.png",
  UAE: "ae-united-arab-emirates.png",
};

const countryCodes: Record<string, string> = {
  Algeria: "DZ",
  Bahrain: "BH",
  Egypt: "EG",
  Iraq: "IQ",
  Jordan: "JO",
  Kuwait: "KW",
  Lebanon: "LB",
  Libya: "LY",
  Morocco: "MA",
  Oman: "OM",
  Palestine: "PS",
  Qatar: "QA",
  "Saudi Arabia": "SA",
  Sudan: "SD",
  Syria: "SY",
  Tunisia: "TN",
  "United Arab Emirates": "AE",
  UAE: "AE",
};

type SourceDoctor = {
  name: string;
  /** Exact source label retained for exports/auditing. */
  sourceName?: string;
  credentials?: string;
  country: string;
  biography: string[];
  image?: string;
  imagePosition?: string;
  priority: number;
  appearance: DoctorAppearance;
};

type DirectorySourcePerson = {
  fullName: string;
  displayRole: string;
  countryName: string;
  flagFilename: string;
  bio: string[];
  imageFilename: string;
  imagePosition?: string;
  group: string;
};

type BoardSourcePerson = {
  name: string;
  fullName: string;
  credentials: string[];
  displayRole: string;
  group: string;
  groupLabel: string;
  country: { name: string };
  bio: string[];
  image: { filename: string };
};

type AaaaSourcePerson = {
  name: string;
  country: string;
  groupRole: string;
  professionalTitle: string;
  bioSource: string;
  profileImage: { localPath: string };
};

const identityGroups = [
  ["basel masri", "basel k masri"],
  ["basel el zorkany", "bassel el zorkany", "bassel elzorkany"],
  ["nizar abdullateef jasim", "nizar abdulateef jasim", "nizar abdulateef jassim", "nizar abdulateef"],
  ["nelly ziade zoghbi", "nelly ziade", "nelly zoghbi"],
  ["manal el rakaawi", "manal el rakawi", "manal al raqqawi"],
  // Two different Algerian rheumatologists, not spellings of one name: Chafika
  // Haouichet is a full ARCH member, Chafia Dahou-Makhloufi appears only in the
  // ARCH network. Grouping them collapsed Haouichet into Dahou-Makhloufi and
  // dropped her from every members list.
  ["chafia dahou makhloufi", "chafia makhloufi dahoui"],
  ["chafika haouichet", "chafika haouichat"],
  ["soad hashad", "soah hashad", "souad hashad", "soad salem hashad"],
  ["suad hanawi", "suad hannawi", "suad hennawi"],
  ["samar al emadi", "samar el emadi"],
  ["fatemah baroun", "fatemah baron"],
  ["fatemah abutiban", "fatima abu tiban", "fatima abutiban"],
  ["asal adnan", "asal adnan ridha"],
  ["fatima a alnaimat", "fatima alnaimat"],
  ["wafa madanat", "wafaa madanat"],
  ["wafa hamdi", "wafaa hamdy"],
  ["laila said ayoub", "laila ayoub"],
  ["muna al mutairi", "muna almutairi"],
  ["mohammad hammoudeh", "mohammed hamoudeh"],
  ["mira merashli", "mira merhachly"],
  // Middle names and initials produced a second identity for the same person.
  // Verified by matching country plus overlapping page placements.
  ["tariq al araimi", "tariq alfanna al araimi"],
  ["hebah al hajeri", "hebah a al hajeri"],
  ["batool al lawati", "batool hassan al lawati"],
  ["suad mohammed", "suad abd ellateif eltaybe mohammed"],
  // Apostrophe/spacing split one person into two ("Sa'oud" vs "Saoud").
  ["sima abu al saoud", "sima abu al sa oud"],
] as const;

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(dr|prof|professor)\.?\s+/i, "")
    .split(",")[0]
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

const identityAliases = new Map<string, string>();
for (const [canonical, ...aliases] of identityGroups) {
  const canonicalKey = normalizeName(canonical);
  identityAliases.set(canonicalKey, canonicalKey);
  for (const alias of aliases) identityAliases.set(normalizeName(alias), canonicalKey);
}

function identityKey(name: string) {
  const normalized = normalizeName(name);
  return identityAliases.get(normalized) ?? normalized;
}

function splitFullName(fullName: string) {
  const [rawName, ...credentialParts] = fullName.split(",");
  return {
    name: rawName.replace(/^(Dr|Prof|Professor)\.?\s+/i, "").trim(),
    credentials: credentialParts.join(",").trim(),
  };
}

function cleanCredentials(value = "") {
  return value.replace(/\s*[·|]\s*Ex Officio.*$/i, "").trim();
}

function localAssetPath(path: string) {
  return path.replace(/^public[\\/]/, "/").replaceAll("\\", "/");
}

function appearance(
  pageId: string,
  pageTitle: string,
  path: string,
  section: string,
  role = "",
): DoctorAppearance {
  return {
    id: `${pageId}:${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    pageId,
    pageTitle,
    path,
    section,
    role,
  };
}

const sourceDoctors: SourceDoctor[] = [];

for (const person of boardData.people as BoardSourcePerson[]) {
  sourceDoctors.push({
    name: person.name,
    sourceName: person.fullName,
    credentials: person.credentials.join(", "),
    country: person.country.name,
    biography: person.bio,
    image: `/images/board/${person.image.filename}`,
    priority: 100,
    appearance: appearance(
      "board-of-directors",
      "Board of Directors",
      "/about/board",
      person.groupLabel,
      person.displayRole,
    ),
  });
}

function addDirectorySource(
  people: DirectorySourcePerson[],
  config: {
    pageId: string;
    pageTitle: string;
    path: string;
    section: string;
    imageDirectory: string;
    priority: number;
  },
) {
  for (const person of people) {
    const parsed = splitFullName(person.fullName);
    sourceDoctors.push({
      name: parsed.name,
      sourceName: person.fullName,
      credentials: parsed.credentials,
      country: person.countryName,
      biography: person.bio,
      image:
        person.imageFilename === "profile-placeholder.jpg"
          ? undefined
          : `${config.imageDirectory}/${person.imageFilename}`,
      imagePosition: person.imagePosition,
      priority: config.priority,
      appearance: appearance(
        config.pageId,
        config.pageTitle,
        config.path,
        config.section,
        person.displayRole,
      ),
    });
  }
}

addDirectorySource(scientificData.people as DirectorySourcePerson[], {
  pageId: "scientific-committee",
  pageTitle: "Scientific Committee",
  path: "/about/scientific-committee",
  section: "Scientific Committee",
  imageDirectory: "/images/scientific-committee",
  priority: 90,
});

addDirectorySource(mediaData.people as DirectorySourcePerson[], {
  pageId: "media-group",
  pageTitle: "ArLAR Media Group",
  path: "/about/media-group",
  section: "Media Group",
  imageDirectory: "/images/media-group",
  priority: 80,
});

addDirectorySource(collegeData.people as DirectorySourcePerson[], {
  pageId: "arlar-college-members",
  pageTitle: "ArLAR College Members",
  path: "/college/members",
  section: "College Members",
  imageDirectory: "/images/college-members",
  priority: 70,
});

const aaaaBoard = aaaaData.board as AaaaSourcePerson[];
const aaaaMembers = aaaaData.members as AaaaSourcePerson[];
for (const [section, people] of [
  ["Group Board", aaaaBoard],
  ["Members", aaaaMembers],
] as const) {
  for (const person of people) {
    sourceDoctors.push({
      name: splitFullName(person.name).name,
      sourceName: person.name,
      country: person.country,
      biography: [person.professionalTitle, person.bioSource].filter(Boolean),
      image: localAssetPath(person.profileImage.localPath),
      priority: 50,
      appearance: appearance(
        "sig-aaaa",
        "Arab Adult Arthritis Awareness Group",
        "/special-interest-groups/arab-adult-arthritis-awareness",
        section,
        person.groupRole,
      ),
    });
  }
}

for (const profile of sigProfiles) {
  for (const tab of profile.tabs) {
    if (tab.kind === "people") {
      for (const person of tab.people) {
        sourceDoctors.push({
          name: person.name,
          sourceName: person.name,
          credentials: person.credentials,
          country: person.country,
          biography: person.bio ?? [],
          image: person.image,
          priority: 60,
          appearance: appearance(
            `sig-${profile.slug}`,
            profile.name,
            `/special-interest-groups/${profile.slug}`,
            tab.label,
            person.role ?? "",
          ),
        });
      }
    }

    if (tab.kind === "network") {
      for (const member of tab.members) {
        sourceDoctors.push({
          name: splitFullName(member.name).name,
          sourceName: member.name,
          country: member.country,
          biography: [],
          priority: 10,
          appearance: appearance(
            `sig-${profile.slug}`,
            profile.name,
            `/special-interest-groups/${profile.slug}`,
            tab.label,
          ),
        });
      }
    }
  }
}

sourceDoctors.push(
  {
    name: "Nizar AbdulLateef Jasim",
    sourceName: "Nizar AbdulLateef Jasim",
    credentials: "MD",
    country: "Iraq",
    biography: [],
    priority: 5,
    appearance: appearance(
      "president-message",
      "President's Message",
      "/about/president-message",
      "President's Message",
      "President of ArLAR",
    ),
  },
  {
    name: "Basel Masri",
    sourceName: "Basel Masri",
    credentials: "MD",
    country: "Jordan",
    biography: [],
    priority: 5,
    appearance: appearance(
      "arlar21-president-message",
      "ArLAR21 Jordan e-Congress",
      "/congresses/arlar21",
      "President's Message",
      "President of the e-Congress",
    ),
  },
);

function richerBiography(a: SourceDoctor, b: SourceDoctor) {
  const score = (doctor: SourceDoctor) =>
    doctor.biography.length * 1000 +
    doctor.biography.join(" ").length +
    doctor.priority;
  return score(a) >= score(b) ? a : b;
}

function richerCredentials(candidates: SourceDoctor[]) {
  return candidates
    .map((candidate) => cleanCredentials(candidate.credentials))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] ?? "";
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

/**
 * Arabic profiles are keyed by the English full name as it appears in the
 * source files, then looked up through `identityKey` so spelling variants
 * across pages still resolve to the same person.
 */
type ArabicProfile = { nameAr?: string; biographyAr?: string[] };
const arabicProfiles = new Map<string, ArabicProfile>(
  Object.entries(doctorArabicData as Record<string, ArabicProfile>).map(
    ([englishName, profile]) => [identityKey(splitFullName(englishName).name), profile] as const,
  ),
);

function arabicProfileFor(names: readonly string[]): ArabicProfile {
  for (const name of names) {
    const match = arabicProfiles.get(identityKey(splitFullName(name).name));
    if (match) return match;
  }
  return {};
}

/** French profiles follow the same keying as the Arabic ones above. */
type FrenchProfile = { nameFr?: string; biographyFr?: string[] };
const frenchProfiles = new Map<string, FrenchProfile>(
  Object.entries(doctorFrenchData as Record<string, FrenchProfile>).map(
    ([englishName, profile]) => [identityKey(splitFullName(englishName).name), profile] as const,
  ),
);

function frenchProfileFor(names: readonly string[]): FrenchProfile {
  for (const name of names) {
    const match = frenchProfiles.get(identityKey(splitFullName(name).name));
    if (match) return match;
  }
  return {};
}

const groupedDoctors = new Map<string, SourceDoctor[]>();
for (const doctor of sourceDoctors) {
  const key = identityKey(doctor.name);
  const group = groupedDoctors.get(key) ?? [];
  group.push(doctor);
  groupedDoctors.set(key, group);
}

export const doctorDatabase: DoctorRecord[] = [...groupedDoctors.entries()]
  .map(([key, candidates]) => {
    const sorted = [...candidates].sort((a, b) => b.priority - a.priority);
    const identitySource = sorted[0];
    const imageSource = sorted.find((candidate) => candidate.image);
    const biographySource = candidates.reduce(richerBiography);
    const credentials = richerCredentials(candidates);
    const country = identitySource.country === "UAE" ? "United Arab Emirates" : identitySource.country;
    const name = splitFullName(identitySource.name).name;
    const slug = key.replaceAll(" ", "-");
    const aliases = unique(candidates.map((candidate) => splitFullName(candidate.name).name));
    const sourceFullNames = unique(candidates.map((candidate) => candidate.sourceName ?? candidate.name));
    const profileNames = [
      identitySource.name,
      ...candidates.map((candidate) => candidate.sourceName ?? candidate.name),
    ];
    const arabic = arabicProfileFor(profileNames);
    const french = frenchProfileFor(profileNames);
    const appearances = candidates
      .map((candidate) => candidate.appearance)
      .filter(
        (candidate, index, all) =>
          all.findIndex(
            (item) =>
              item.pageId === candidate.pageId &&
              item.section === candidate.section &&
              item.role === candidate.role,
          ) === index,
      );

    return {
      id: slug,
      slug,
      name,
      credentials,
      fullName: formatDoctorName(name),
      country,
      countryCode: countryCodes[country] ?? "",
      flagFilename: countryFlags[country] ?? "",
      biography: biographySource.biography,
      nameAr: arabic.nameAr ?? "",
      biographyAr: arabic.biographyAr ?? [],
      nameFr: french.nameFr ?? "",
      biographyFr: french.biographyFr ?? [],
      image: imageSource?.image ?? "/images/college-members/profile-placeholder.jpg",
      imagePosition: imageSource?.imagePosition,
      aliases,
      sourceFullNames,
      availableOn: unique(appearances.map((item) => item.pageId)),
      appearances,
    } satisfies DoctorRecord;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Every placement slot that exists on the website, derived from the source
 * data rather than hand-maintained, so a new page or section becomes
 * assignable in the admin panel automatically. `role` is per-doctor and is
 * therefore blank here.
 */
export const availablePlacements: DoctorAppearance[] = [
  ...new Map(
    doctorDatabase
      .flatMap((doctor) => doctor.appearances)
      .map((placement) => [placement.id, { ...placement, role: "" }] as const),
  ).values(),
].sort(
  (a, b) =>
    a.pageTitle.localeCompare(b.pageTitle) || a.section.localeCompare(b.section),
);

const doctorsByIdentity = new Map(
  doctorDatabase.flatMap((doctor) => [
    [identityKey(doctor.name), doctor] as const,
    ...doctor.aliases.map((alias) => [identityKey(alias), doctor] as const),
  ]),
);

export function getDoctorByName(name: string) {
  const doctor = doctorsByIdentity.get(identityKey(name));
  return doctor && !isAdminRecordDeleted("doctors", doctor.id) ? doctor : undefined;
}

export function canonicalizeSigProfile(profile: SigProfile, managedDoctors?: readonly DoctorRecord[]): SigProfile {
  const managedDirectory = managedDoctors ? new Map(managedDoctors.flatMap((doctor) => [doctor.name, doctor.fullName, ...doctor.aliases, ...doctor.sourceFullNames].map((name) => [identityKey(name), doctor] as const))) : null;
  const findDoctor = (name: string) => managedDirectory?.get(identityKey(name)) ?? getDoctorByName(name);
  const pageId = `sig-${profile.slug}`;
  const assignedDoctors = (section: string) => {
    const assigned = managedDoctors?.flatMap((doctor) => {
      const placement = doctor.appearances.find((item) => item.pageId === pageId && identityKey(item.section) === identityKey(section));
      return placement ? [{ doctor, placement }] : [];
    });
    if (!assigned) return assigned;
    const hasCompleteOrder = assigned.every(({ placement }) => placement.sortOrderVersion === 1 && Number.isFinite(placement.sortOrder));
    return assigned.toSorted((a, b) =>
      (hasCompleteOrder ? (a.placement.sortOrder ?? 0) - (b.placement.sortOrder ?? 0) : 0)
      || a.doctor.fullName.localeCompare(b.doctor.fullName),
    );
  };
  return {
    ...profile,
    tabs: profile.tabs.map((tab) => {
      if (tab.kind === "people") {
        const assigned = assignedDoctors(tab.label);
        return {
          ...tab,
          people: assigned
            ? assigned.map(({ doctor, placement }): SigPerson => {
                const person = tab.people.find((candidate) =>
                  [doctor.name, doctor.fullName, ...doctor.aliases, ...doctor.sourceFullNames]
                    .some((name) => identityKey(name) === identityKey(candidate.name)),
                );
                return {
                  ...person,
                  doctorId: doctor.id,
                  name: doctor.name,
                  nameAr: doctor.nameAr,
                  nameFr: doctor.nameFr,
                  credentials: doctor.credentials,
                  role: placement.role || person?.role,
                  country: doctor.country,
                  bio: doctor.biography,
                  biographyAr: doctor.biographyAr,
                  biographyFr: doctor.biographyFr,
                  image: doctor.image,
                  imagePosition: doctor.imagePosition,
                  appearances: doctor.appearances,
                };
              })
            : tab.people.map((person): SigPerson => {
                const doctor = findDoctor(person.name);
                if (!doctor) return person;
                return {
                  ...person,
                  doctorId: doctor.id,
                  name: doctor.name,
                  nameAr: doctor.nameAr,
                  nameFr: doctor.nameFr,
                  credentials: doctor.credentials,
                  country: doctor.country,
                  bio: doctor.biography,
                  biographyAr: doctor.biographyAr,
                  biographyFr: doctor.biographyFr,
                  image: doctor.image,
                  imagePosition: doctor.imagePosition,
                  appearances: doctor.appearances,
                };
              }),
        };
      }

      if (tab.kind === "network") {
        const assigned = assignedDoctors(tab.label);
        if (assigned) {
          return {
            ...tab,
            members: assigned.map(({ doctor }) => ({ name: doctor.name, country: doctor.country })),
          };
        }
        const seenDoctors = new Set<string>();
        return {
          ...tab,
          members: tab.members.flatMap((member) => {
            const doctor = findDoctor(member.name);
            const memberId = doctor?.id ?? identityKey(member.name);
            if (seenDoctors.has(memberId)) return [];
            seenDoctors.add(memberId);
            return [
              doctor
                ? { name: doctor.name, country: doctor.country }
                : member,
            ];
          }),
        };
      }

      return tab;
    }),
  };
}
