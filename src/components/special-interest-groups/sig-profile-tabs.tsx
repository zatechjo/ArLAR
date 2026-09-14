"use client";

import Image from "next/image";
import { useState } from "react";

import { PeopleCardGrid, type DirectoryPerson } from "@/components/about/people-directory";
import { EventCard, type CollegeEvent } from "@/components/college/events-directory";
import { ArrowUpRight, CalendarDays, FileText, Globe, Users } from "@/components/icons";
import { formatDoctorName } from "@/lib/doctor-name";
import type { SigCase, SigProfile, SigSection, SigTab } from "@/data/sig-profiles";
import { useTranslations } from "@/i18n/locale-context";

const countryFlags: Record<string, string> = {
  Algeria:"dz-algeria.png", Bahrain:"bahrain.png", Egypt:"eg-egypt.png", Iraq:"iq-iraq.png",
  Jordan:"jo-jordan.png", Kuwait:"kw-kuwait.png", Lebanon:"lb-lebanon.png", Libya:"ly-libya.png",
  Morocco:"ma-morocco.png", Oman:"om-oman.png", Palestine:"ps-palestine.png", Qatar:"qa-qatar.png",
  "Saudi Arabia":"sa-saudi-arabia.png", Sudan:"sd-sudan.png", Syria:"sy-syria.webp", Tunisia:"tn-tunisia.png",
  "United Arab Emirates":"ae-united-arab-emirates.png", UAE:"ae-united-arab-emirates.png",
};

function tabCount(tab: SigTab) {
  if (tab.kind === "people") return tab.people.length;
  if (tab.kind === "network") return tab.members.length;
  if (tab.kind === "replays") return tab.replays.length;
  if (tab.kind === "resources") return tab.resources.length;
  if (tab.kind === "gallery") return tab.items.length;
  if (tab.kind === "cases") return tab.cases.length;
  return undefined;
}

function TabIcon({ kind }: { kind: SigTab["kind"] }) {
  if (kind === "people" || kind === "network") return <Users className="size-4" />;
  if (kind === "replays") return <CalendarDays className="size-4" />;
  if (kind === "resources") return <FileText className="size-4" />;
  return <Globe className="size-4" />;
}

function SectionsPanel({ sections }: { sections: SigSection[] }) {
  const { locale, t } = useTranslations();
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {sections.map((section, index) => (
        <section
          key={section.title}
          className={(index === 0 && sections.length % 2 === 1 ? "lg:col-span-2 " : "") + "rounded-[1.7rem] border border-ink-100 bg-white p-6 sm:p-8"}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-crimson-600" />
            <h2 className={`font-display font-semibold tracking-[0.15em] text-crimson-700 uppercase ${
              locale === "ar" ? "text-[13px]" : "text-[11px]"
            }`}>{t(section.title)}</h2>
          </div>
          {section.paragraphs ? (
            <div className="mt-5 space-y-4 text-[14px] leading-7 text-ink-600">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
            </div>
          ) : null}
          {section.items ? (
            <ul className="mt-5 grid gap-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-[14px] leading-6 text-ink-600">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-jade-500" />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function AboutPanel({ profile }: { profile: SigProfile }) {
  const { locale, t } = useTranslations();
  if (!profile.intro?.length && !profile.video && !profile.document) return null;

  return (
    <section className="rounded-[1.7rem] border border-ink-100 bg-white p-6 sm:p-8">
      <div className={profile.video ? "grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-8" : "max-w-4xl"}>
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-crimson-600" />
            <h2 className={`font-display font-semibold tracking-[0.16em] text-crimson-700 uppercase ${locale === "ar" ? "text-[13px]" : "text-[10px]"}`}>
              {locale === "ar" && profile.slug === "francophone"
                ? `عن ${t(profile.name)}`
                : `${t("About")} ${profile.abbreviation}`}
            </h2>
          </div>
          {profile.intro?.length ? (
            <div className="mt-5 space-y-4 text-[14px] leading-7 text-ink-600">
              {profile.intro.map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
            </div>
          ) : null}
          {profile.document ? (
            <a href={profile.document.href} target="_blank" rel="noreferrer" className="group mt-6 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-ink-200 px-5 font-display text-[13px] font-semibold text-ink-800 transition-colors hover:border-jade-300 hover:text-jade-800">
              <FileText className="size-4 text-crimson-600" />
              {t(profile.document.action)}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ) : null}
        </div>
        {profile.video ? (
          <div className="overflow-hidden rounded-2xl bg-[#07131f] shadow-sm">
            <video controls preload="metadata" className="aspect-video w-full" src={profile.video}>
              {t("Your browser does not support embedded video.")}
            </video>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function toDirectoryPeople(tab: Extract<SigTab, { kind: "people" }>): DirectoryPerson[] {
  return tab.people.map((person, index) => ({
    doctorId: person.doctorId,
    id: person.doctorId ?? `${tab.id}-${index}`,
    slug: person.doctorId ?? `${tab.id}-${index}`,
    sortOrder: index + 1,
    group: person.role ? "leadership" : "members",
    fullName: formatDoctorName(person.name),
    nameAr: person.nameAr, nameFr: person.nameFr,
    displayRole: person.role ?? "",
    countryName: person.country,
    flagFilename: countryFlags[person.country] ?? "",
    bio: person.bio ?? [],
    biographyAr: person.biographyAr, biographyFr: person.biographyFr,
    imageFilename: person.image ?? "/images/college-members/profile-placeholder.jpg",
    imagePosition: person.imagePosition,
    appearances: person.appearances,
  }));
}

function PeoplePanel({ tab }: { tab: Extract<SigTab, { kind: "people" }> }) {
  const { t } = useTranslations();
  const people = toDirectoryPeople(tab);
  return (
    <section>
      <div className="flex items-end justify-between gap-5">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950">{t(tab.label)}</h2>
        <span className="rounded-xl border border-ink-100 bg-white px-4 py-2 font-display text-[11px] font-semibold text-ink-500">{people.length} {t("members")}</span>
      </div>
      <PeopleCardGrid people={people} imageDirectory="" className="mt-7" />
    </section>
  );
}

function normalizeReplayUrl(value: string) {
  try {
    const url = new URL(value);
    url.hostname = url.hostname.replace(/^www\./, "");
    url.searchParams.delete("si");
    return `${url.hostname}${url.pathname}?${[...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => `${key}=${entry}`).join("&")}`;
  } catch {
    return value;
  }
}

function replayAsCollegeEvent(
  replay: Extract<SigTab, { kind: "replays" }>["replays"][number],
  profileName: string,
  index: number,
  collegeEventsByReplayUrl: Map<string, CollegeEvent>,
): CollegeEvent {
  const source = collegeEventsByReplayUrl.get(normalizeReplayUrl(replay.href));
  if (source) {
    return {
      ...source,
      id: `sig-${profileName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
      groups: [profileName, ...source.groups.filter((group) => group !== profileName && group !== "ArLAR College")],
    };
  }

  const parsedDate = new Date(replay.date);
  return {
    id: `sig-${profileName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    title: replay.title,
    date: Number.isNaN(parsedDate.valueOf()) ? new Date(0).toISOString() : parsedDate.toISOString(),
    year: Number.isNaN(parsedDate.valueOf()) ? 0 : parsedDate.getUTCFullYear(),
    groups: [profileName],
    speakers: null,
    webinarUrl: replay.href,
    image: "2020-07-23-the-art-of-telehealth-webinar.jpg",
  };
}

function ReplaysPanel({ tab, profileName, collegeEvents }: { tab: Extract<SigTab, { kind: "replays" }>; profileName: string; collegeEvents: CollegeEvent[] }) {
  const { t } = useTranslations();
  const collegeEventsByReplayUrl = new Map(collegeEvents.map((event) => [normalizeReplayUrl(event.webinarUrl), event]));
  return (
    <section>
      {tab.intro ? <p className="mb-7 max-w-3xl text-[14px] leading-7 text-ink-600">{t(tab.intro)}</p> : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tab.replays.map((replay, index) => <EventCard key={replay.title + replay.date} event={replayAsCollegeEvent(replay, profileName, index, collegeEventsByReplayUrl)} />)}
      </div>
    </section>
  );
}

function ResourcesPanel({ tab }: { tab: Extract<SigTab, { kind: "resources" }> }) {
  const { locale, t } = useTranslations();
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{tab.resources.map((resource) => (
    <a key={resource.title} href={resource.href} target="_blank" rel="noreferrer" className="group flex min-h-56 cursor-pointer flex-col rounded-[1.7rem] border border-ink-100 bg-white p-6 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-jade-200">
      <FileText className="size-6 text-crimson-600" />
      {resource.date ? <time dateTime={resource.date} className="mt-5 font-display text-[10px] font-semibold tracking-[0.12em] text-ink-400 uppercase">{formatResourceDate(resource.date, locale)}</time> : null}
      <h2 className={resource.date ? "mt-2 font-display text-xl font-semibold leading-7 text-ink-950" : "mt-6 font-display text-xl font-semibold leading-7 text-ink-950"}>{t(resource.title)}</h2>
      {resource.description ? <p className="mt-3 text-[13px] leading-6 text-ink-500">{t(resource.description)}</p> : null}
      <span className="mt-auto flex items-center gap-2 pt-5 font-display text-[13px] font-semibold text-jade-700">{t(resource.action)}<ArrowUpRight className="size-4" /></span>
    </a>
  ))}</div>;
}

function formatResourceDate(date: string, locale: string) {
  const normalized = /^\d{4}-\d{2}$/.test(date) ? `${date}-01T00:00:00Z` : date;
  return new Date(normalized).toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

function GalleryPanel({ tab }: { tab: Extract<SigTab, { kind: "gallery" }> }) {
  const { t } = useTranslations();
  return <div className="grid gap-5 lg:grid-cols-2">{tab.items.map((item) => (
    <figure key={item.title} className="overflow-hidden rounded-[1.7rem] border border-ink-100 bg-white">
      <div className="relative aspect-[16/10] bg-ink-50"><Image src={item.image} alt={item.title} fill unoptimized sizes="(max-width:1024px) 100vw, 50vw" className="object-contain" /></div>
      <figcaption className="border-t border-ink-100 px-6 py-4 font-display text-[14px] font-semibold text-ink-800">{t(item.title)}</figcaption>
    </figure>
  ))}</div>;
}

function CaseCard({ item }: { item: SigCase }) {
  const { t } = useTranslations();
  return <article className="overflow-hidden rounded-[1.7rem] border border-ink-100 bg-white">
    <div className="grid gap-2 bg-[#07131f] p-6 text-white sm:grid-cols-2">
      {item.images.map((image, index) => <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5"><Image src={image} alt={`${item.title}, image ${index + 1}`} fill unoptimized sizes="(max-width:640px) 100vw, 40vw" className="object-contain" /></div>)}
    </div>
    <div className="p-6 sm:p-8"><h2 className="font-display text-2xl font-semibold text-ink-950">{t(item.title)}</h2>
      <div className="mt-5 space-y-3 text-[14px] leading-7 text-ink-600">{item.prompt.map(p=><p key={p}>{t(p)}</p>)}</div>
      <div className="mt-6 rounded-2xl border border-jade-100 bg-jade-50/60 p-5"><p className="font-display text-[10px] font-semibold tracking-[0.15em] text-jade-700 uppercase">{t("Answer")}</p><p className="mt-2 font-display text-lg font-semibold text-ink-950">{t(item.answer)}</p></div>
      {item.treatment ? <div className="mt-6"><h3 className="font-display text-lg font-semibold text-ink-900">{t("Treatment")}</h3><ul className="mt-3 list-disc space-y-2 ps-5 text-[14px] text-ink-600">{item.treatment.map(x=><li key={x}>{t(x)}</li>)}</ul></div> : null}
      {item.learningPoints ? <div className="mt-6"><h3 className="font-display text-lg font-semibold text-ink-900">{t("Important learning points")}</h3><ul className="mt-3 list-disc space-y-2 ps-5 text-[14px] text-ink-600">{item.learningPoints.map(x=><li key={x}>{t(x)}</li>)}</ul></div> : null}
    </div>
  </article>;
}

function Panel({ tab, profileName, collegeEvents }: { tab: SigTab; profileName: string; collegeEvents: CollegeEvent[] }) {
  const { t } = useTranslations();
  if (tab.kind === "sections") return <SectionsPanel sections={tab.sections} />;
  if (tab.kind === "people") return <PeoplePanel tab={tab} />;
  if (tab.kind === "network") return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tab.members.map((member, index)=><div key={`${member.name}-${member.country}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4"><span className="font-display text-[14px] font-semibold text-ink-900">{formatDoctorName(member.name)}</span><span className="text-[11px] text-ink-400">{t(member.country)}</span></div>)}</div>;
  if (tab.kind === "replays") return <ReplaysPanel tab={tab} profileName={profileName} collegeEvents={collegeEvents} />;
  if (tab.kind === "resources") return <ResourcesPanel tab={tab} />;
  if (tab.kind === "gallery") return <GalleryPanel tab={tab} />;
  return <div className="grid gap-6">{tab.cases.map(item=><CaseCard key={item.title} item={item} />)}</div>;
}

export function SigProfileTabs({ profile, collegeEvents }: { profile: SigProfile; collegeEvents: CollegeEvent[] }) {
  const { t } = useTranslations();
  const [activeId, setActiveId] = useState(profile.tabs[0]?.id ?? "");
  const activeTab = profile.tabs.find(tab => tab.id === activeId) ?? profile.tabs[0];

  return <div>
    <nav aria-label={`${t(profile.name)} ${t("sections")}`} className="overflow-x-auto overflow-y-hidden border-b border-ink-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-6" role="tablist">{profile.tabs.map(tab => {
        const active = tab.id === activeId; const count = tabCount(tab);
        return <button key={tab.id} type="button" role="tab" aria-selected={active} aria-controls="sig-profile-panel" onClick={()=>setActiveId(tab.id)} className={(active?"border-crimson-600 text-crimson-700":"border-transparent text-ink-500 hover:border-ink-200 hover:text-ink-900") + " -mb-px inline-flex min-h-14 cursor-pointer items-center gap-2 border-b-2 px-1 font-display text-[13px] font-semibold transition-colors"}><TabIcon kind={tab.kind}/>{t(tab.label)}{count !== undefined ? <span className={active?"text-crimson-400":"text-ink-300"}>{count}</span>:null}</button>
      })}</div>
    </nav>
    <div id="sig-profile-panel" role="tabpanel" className="mt-6">
      {activeTab ? (
        activeTab.id === "overview" ? (
          <div className="grid gap-5">
            <AboutPanel profile={profile} />
            <Panel tab={activeTab} profileName={profile.name} collegeEvents={collegeEvents} />
          </div>
        ) : <Panel tab={activeTab} profileName={profile.name} collegeEvents={collegeEvents} />
      ) : null}
    </div>
  </div>;
}
