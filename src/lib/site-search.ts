import "server-only";

import { patientFaqs } from "@/data/patient-faqs";
import { listPublicNewsArticlesAsync } from "@/lib/admin-news-repository";
import { getDeletedAdminRecordIdsAsync } from "@/lib/admin-deletion-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { getManagedSigDirectoryAsync } from "@/lib/sig-directory-repository";
import { getManagedEducationalLibrary } from "@/lib/managed-educational-library";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import type { SearchResult } from "@/lib/search-types";

export type { SearchResult, SearchResultKind } from "@/lib/search-types";

type SearchRecord = SearchResult & {
  searchText: string;
  titleText: string;
};

const sitePages = [
  ["about", "About ArLAR", "Mission, vision, history, and the story of ArLAR.", "/about", "organisation league history mission vision"],
  ["president", "President's Message", "A message from the President of ArLAR.", "/about/president-message", "leadership president"],
  ["board", "Board of Directors", "Meet ArLAR's regional leadership and board members.", "/about/board", "leadership doctors members"],
  ["scientific", "Scientific Committee", "The committee guiding ArLAR's scientific agenda.", "/about/scientific-committee", "research committee doctors"],
  ["media", "ArLAR Media Group", "The committee leading ArLAR communication and outreach.", "/about/media-group", "media committee doctors communication"],
  ["bylaws", "ArLAR Bylaws", "Browse the official governing document of ArLAR.", "/about/bylaws", "governance rules pdf document"],
  ["secretariat", "ArLAR Secretariat", "Administrative contacts and Secretariat information.", "/about/secretariat", "administration contact email phone"],
  ["college", "ArLAR College", "Learn about the College's purpose, educational mission, and professional learning programme.", "/college/about", "education courses learning mission"],
  ["college-members", "ArLAR College Members", "Meet the ArLAR College community.", "/college/members", "doctors faculty people"],
  ["college-events", "ArLAR College Events", "Browse current webinars and the complete replay archive.", "/college/events", "webinars videos replay courses"],
  ["members", "ArLAR Member Associations", "Explore ArLAR's national rheumatology associations.", "/members", "countries societies associations"],
  ["arlar21", "ArLAR21 Jordan e-Congress", "Browse the ArLAR21 Jordan scientific programme and congress replays.", "/congresses/arlar21-replay", "congress replay jordan 2021 videos"],
  ["arlar23", "ArLAR23 Kuwait Congress", "Browse every available ArLAR23 Kuwait Congress replay from all three days.", "/congresses/arlar23-replay", "congress replay kuwait 2023 videos pediatric adult"],
  ["arlar27", "ArLAR27 Iraq Congress", "The official ArLAR27 congress hub for Baghdad, 24–27 March 2027.", "/congresses/arlar27", "congress iraq baghdad 2027 annual"],
  ["arlar27-welcome", "ArLAR27 Welcome Message", "Welcome to ArLAR27 in Baghdad.", "/congresses/arlar27/welcome", "congress iraq baghdad welcome"],
  ["arlar27-committee", "ArLAR27 Congress Committee", "Leadership and committees preparing ArLAR27.", "/congresses/arlar27/committee", "congress honorary president ziad shafiq al rawi"],
  ["arlar27-faculty", "ArLAR27 Faculty", "Faculty announcements for ArLAR27 Iraq.", "/congresses/arlar27/faculty", "speakers congress iraq"],
  ["arlar27-abstracts", "ArLAR27 Abstract Submission", "Abstract submission information for ArLAR27.", "/congresses/arlar27/abstracts", "research submit call papers congress"],
  ["arlar27-registration", "ArLAR27 Registration", "Registration information for ArLAR27 in Baghdad.", "/congresses/arlar27/registration", "register fees attendance congress"],
  ["arlar27-programme", "ArLAR27 Scientific Programme", "The four-day ArLAR27 programme in Baghdad.", "/congresses/arlar27/programme", "schedule sessions march 24 25 26 27"],
  ["arlar27-iraq", "ArLAR27 About Iraq", "Discover Baghdad, the host city of ArLAR27.", "/congresses/arlar27/about-iraq", "travel destination venue baghdad"],
  ["member-events", "Members Events & Congresses", "News and events from ArLAR member countries.", "/events/members", "countries congress events societies"],
  ["international-events", "International Events & Congresses", "International rheumatology meetings and congresses.", "/events/international", "global international conference congress"],
  ["related-links", "Related Links", "Useful regional and international rheumatology resources.", "/events/related-links", "associations resources organisations"],
  ["publications", "ArLAR Publications", "Research, recommendations, and scientific publications from ArLAR.", "/professionals/publications", "research studies papers pdf"],
  ["bulletin", "ArLAR E-Bulletin", "Browse every issue of the ArLAR E-Bulletin.", "/professionals/e-bulletin", "newsletter issues media pdf"],
  ["partners", "ArLAR Partners", "Industry and institutional partners supporting ArLAR.", "/professionals/partners", "sponsors organisations"],
  ["education", "Educational Library", "Search ArLAR webinars, congress replays, publications, and clinical resources.", "/education", "videos learning archive cases documents"],
  ["groups", "Special Interest Groups", "Explore ArLAR's clinical, research, and professional groups.", "/special-interest-groups", "sig clinical groups"],
  ["patients", "For Public & Patients", "Plain-language answers about rheumatology, treatment, daily life, and COVID-19.", "/public-patients", "faq questions arthritis medical information"],
  ["news", "ArLAR News", "Announcements, updates, events, and stories from the ArLAR community.", "/news", "articles blog announcements"],
  ["contact", "Contact ArLAR", "Contact the ArLAR Secretariat for administrative enquiries.", "/contact", "email form administration"],
  ["privacy", "Privacy Policy", "How ArLAR handles personal information and privacy choices.", "/privacy", "data protection personal information rights cookies"],
  ["terms", "Terms & Conditions", "Terms for using the ArLAR website and its educational resources.", "/terms", "website conditions legal medical disclaimer acceptable use"],
] as const;

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[^a-zA-Z0-9\u0600-\u06ff]+/g, " ")
    .trim()
    .toLowerCase();
}

function makeRecord(result: SearchResult, keywords = ""): SearchRecord {
  return {
    ...result,
    titleText: normalize(result.title),
    searchText: normalize(
      [result.title, result.description, result.meta, keywords].filter(Boolean).join(" "),
    ),
  };
}

function resourceHref(id: string, collectionHref: string) {
  if (id.startsWith("college-")) {
    return `/college/events#college-video-${id.slice("college-".length)}`;
  }
  if (id.startsWith("aaaa-")) {
    return `${collectionHref}#aaaa-video-${id.slice("aaaa-".length)}`;
  }
  return collectionHref;
}

const pageRecords = sitePages.map(([id, title, description, href, keywords]) =>
  makeRecord({ id: `page-${id}`, kind: "page", title, description, href, meta: "Page" }, keywords),
);

async function getNewsRecords() {
  return (await listPublicNewsArticlesAsync()).map((article) =>
    makeRecord(
      {
        id: `news-${article.id}`,
        kind: "news",
        title: article.title,
        description: article.excerpt || article.contentText.slice(0, 220),
        href: `/news/${article.slug}`,
        image: article.image,
        meta: article.dateLabel,
      },
      [article.categories.join(" "), article.hashtags.join(" "), article.contentText].join(" "),
    ),
  );
}

async function getGroupRecords() {
  const [groups, deleted] = await Promise.all([getManagedSigDirectoryAsync(), getDeletedAdminRecordIdsAsync("sigs")]);
  return groups.filter(
    (group) => group.visible && !deleted.has(group.slug),
  ).map((group) =>
  makeRecord(
    {
      id: `group-${group.slug}`,
      kind: "group",
      title: group.name,
      description: `${group.abbreviation} · ArLAR Special Interest Group`,
      href: `/special-interest-groups/${group.slug}`,
      image: group.logo,
      meta: group.abbreviation,
    },
    `${group.abbreviation} special interest group`,
  ),
  );
}

async function getLibraryRecords() {
  return (await getManagedEducationalLibrary()).map((resource) => {
  const isVideo = resource.kind === "webinar" || resource.kind === "congress";
  return makeRecord(
    {
      id: `library-${resource.id}`,
      kind: isVideo ? "webinar" : "resource",
      title: resource.title,
      description: resource.description || `${resource.collection} educational resource.`,
      href: resourceHref(resource.id, resource.collectionHref),
      image: resource.image,
      meta: [resource.collection, resource.year].filter(Boolean).join(" · "),
    },
    [...resource.speakers, ...resource.topics, resource.kind, resource.action].join(" "),
  );
  });
}

async function getQuestionRecords() {
  const faqs = await getPublishedSiteContent("patients", "faqs", patientFaqs);
  return faqs.map((faq) =>
  makeRecord(
    {
      id: `question-${faq.id}`,
      kind: "question",
      title: faq.question,
      description: faq.answer[0] || "Patient information from ArLAR.",
      href: "/public-patients#patient-faqs",
      meta: "Public & patients",
    },
    `${faq.category} ${faq.answer.join(" ")}`,
  ),
  );
}

async function getPeopleRecords() {
  const [doctors, deleted] = await Promise.all([listManagedDoctorsAsync(), getDeletedAdminRecordIdsAsync("doctors")]);
  return doctors.flatMap((doctor) => {
  const appearance = doctor.appearances[0];
  if (!appearance || deleted.has(doctor.id)) return [];
  return [
    makeRecord(
      {
        id: `person-${doctor.id}`,
        kind: "person",
        title: doctor.fullName,
        description: [appearance.role, appearance.pageTitle, doctor.country]
          .filter(Boolean)
          .join(" · "),
        href: appearance.path,
        image: doctor.image,
        meta: doctor.country,
        doctor: {
          id: doctor.id,
          fullName: doctor.fullName,
          credentials: doctor.credentials,
          displayRole: appearance.role || appearance.pageTitle,
          countryName: doctor.country,
          flagFilename: doctor.flagFilename,
          bio: doctor.biography,
          imageSrc: doctor.image,
          imagePosition: doctor.imagePosition,
        },
      },
      [doctor.aliases.join(" "), doctor.availableOn.join(" "), doctor.biography.join(" ")].join(" "),
    ),
  ];
  });
}

function scoreRecord(record: SearchRecord, query: string, tokens: string[]) {
  if (!tokens.every((token) => record.searchText.includes(token))) return 0;

  let score = 0;
  if (record.titleText === query) score += 180;
  else if (record.titleText.startsWith(query)) score += 110;
  else if (record.titleText.includes(query)) score += 75;

  for (const token of tokens) {
    if (record.titleText.startsWith(token)) score += 28;
    else if (record.titleText.includes(token)) score += 18;
    else score += 5;
  }

  if (record.kind === "page") score += 8;
  if (record.kind === "group") score += 5;
  return score;
}

export async function searchSite(rawQuery: string, limit = 80): Promise<SearchResult[]> {
  const query = normalize(rawQuery);
  if (!query) return [];
  const tokens = query.split(" ").filter(Boolean);

  const [news, groups, library, questions, people] = await Promise.all([
    getNewsRecords(), getGroupRecords(), getLibraryRecords(), getQuestionRecords(), getPeopleRecords(),
  ]);
  return [...news, ...groups, ...library, ...pageRecords, ...questions, ...people]
    .map((record) => ({ record, score: scoreRecord(record, query, tokens) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.record.title.localeCompare(right.record.title))
    .slice(0, limit)
    .map(({ record }) => {
      const { searchText, titleText, ...result } = record;
      void searchText;
      void titleText;
      return result;
    });
}
