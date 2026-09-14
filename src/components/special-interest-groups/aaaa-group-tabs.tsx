"use client";

import { useState } from "react";

import {
  PeopleCardGrid,
  type DirectoryPerson,
} from "@/components/about/people-directory";
import { AaaaWebinarLibrary } from "@/components/special-interest-groups/aaaa-webinar-library";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Globe,
  Users,
} from "@/components/icons";
import { Instagram, X, YouTube } from "@/components/social-icons";
import type aaaaData from "@/data/aaaa-group.json";
import { useTranslations } from "@/i18n/locale-context";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "board", label: "Group Board" },
  { id: "members", label: "Members" },
  { id: "webinars", label: "Past Webinars" },
] as const;

const aaaaSocialLinks = [
  {
    label: "Instagram",
    handle: "@aaaa.group",
    href: "https://www.instagram.com/aaaa.group/?hl=en",
    Icon: Instagram,
    color: "text-[#d62976]",
  },
  {
    label: "YouTube",
    handle: "AAAA Group",
    href: "https://www.youtube.com/channel/UC_xFKZ02j6gMiplejsUP2tg",
    Icon: YouTube,
    color: "text-[#ff0033]",
  },
  {
    label: "X",
    handle: "@groupaaaa",
    href: "https://x.com/groupaaaa",
    Icon: X,
    color: "text-ink-950",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

function OverviewPanel({ data, memberCount }: { data: typeof aaaaData; memberCount: number }) {
  const { locale, t } = useTranslations();
  const aboutParagraphs = data.page.aboutClean.split("\n\n");
  const [openObjective, setOpenObjective] = useState<number | null>(null);

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.7rem] border border-ink-100 bg-white p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-crimson-600" />
            <h2 className={`font-display font-semibold tracking-[0.17em] text-ink-500 uppercase ${
              locale === "ar" ? "text-[13px]" : "text-[10px]"
            }`}>
              {t("About AAAA Group")}
            </h2>
          </div>
          <div className="mt-6 grid gap-5 text-[14px] leading-7 text-ink-600 lg:grid-cols-3">
            {aboutParagraphs.map((paragraph) => {
              const translated = t(paragraph);
              const accurateText = paragraph.includes("brings together 19 doctors")
                ? translated.replace(/\b19\b/, String(memberCount))
                : translated;
              return <p key={paragraph.slice(0, 36)}>{accurateText}</p>;
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-ink-100 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`font-display font-semibold tracking-[0.17em] text-crimson-600 uppercase ${
              locale === "ar" ? "text-[13px]" : "text-[10px]"
            }`}>
              {t("Connect with the group")}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em] text-ink-950">
              {t("Follow AAAA Group")}
            </h2>
          </div>
          <p className="max-w-md text-[13px] leading-6 text-ink-500">
            {t("Follow AAAA Group for patient education, awareness activities, and webinar updates.")}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {aaaaSocialLinks.map(({ label, handle, href, Icon, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t("AAAA Group on")} ${label}`}
              className="group flex min-h-20 items-center gap-4 rounded-2xl border border-ink-100 bg-[#f8faf9] px-5 py-4 transition-colors hover:border-ink-200 hover:bg-white"
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm ${color}`}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[13px] font-semibold text-ink-900">{label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-ink-500">{handle}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-ink-300 transition-colors group-hover:text-crimson-600" />
            </a>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="relative isolate overflow-hidden rounded-[1.7rem] bg-[#07131f] p-6 text-white sm:p-8">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_90%_12%,rgba(0,149,59,0.24),transparent_32%),radial-gradient(circle_at_8%_90%,rgba(193,2,48,0.22),transparent_36%)]"
          />
          <div className="relative">
          <p className={`font-display font-semibold tracking-[0.17em] text-jade-300 uppercase ${
            locale === "ar" ? "text-[13px]" : "text-[10px]"
          }`}>
              {t("Mission")}
            </p>
            <ul className="mt-6 grid gap-4">
              {data.page.missionSource.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-6 text-sky-50/75"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-jade-400" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-jade-100 bg-jade-50/55 p-6 sm:p-8">
          <p className={`font-display font-semibold tracking-[0.17em] text-jade-700 uppercase ${
            locale === "ar" ? "text-[13px]" : "text-[10px]"
          }`}>
            {t("Vision")}
          </p>
          <p className="mt-6 font-display text-2xl font-semibold leading-9 tracking-[-0.025em] text-ink-900">
            {t(data.page.visionSource)}
          </p>
        </section>
      </div>

      <section className="rounded-[1.7rem] border border-ink-100 bg-white p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className={`font-display font-semibold tracking-[0.17em] text-crimson-600 uppercase ${
            locale === "ar" ? "text-[13px]" : "text-[10px]"
          }`}>
            {t("Objectives")}
          </p>
          <p className="mt-4 text-[14px] leading-7 text-ink-500">
            {t(data.page.objectivesIntroSource)}
          </p>
        </div>

        <div className="mt-7 divide-y divide-ink-100 border-y border-ink-100">
          {data.page.objectives.map((objective) => {
            const isOpen = openObjective === objective.number;
            const panelId = "aaaa-objective-" + objective.number;

            return (
              <div key={objective.number}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() =>
                    setOpenObjective((current) =>
                      current === objective.number ? null : objective.number,
                    )
                  }
                  className="flex w-full cursor-pointer items-center gap-4 py-5 text-start"
                >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-crimson-50 font-display text-[11px] font-semibold text-crimson-700">
                  {String(objective.number).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 font-display text-[16px] font-semibold text-ink-900">
                  {t(objective.title)}
                </span>
                  <ChevronDown
                    className={
                      "size-4 shrink-0 text-ink-400 transition-transform duration-500 ease-in-out " +
                      (isOpen ? "rotate-180" : "")
                    }
                  />
                </button>
                <div
                  id={panelId}
                  className={
                    "grid transition-[grid-template-rows] duration-500 ease-in-out " +
                    (isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
                  }
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="pb-6 ps-8 pe-[3.25rem] text-[14px] leading-7 text-ink-500">
                      {t(objective.sourceText)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PeoplePanel({
  mode,
  people,
}: {
  mode: "board" | "members";
  people: DirectoryPerson[];
}) {
  const { locale, t } = useTranslations();
  const isBoard = mode === "board";

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className={`font-display font-semibold tracking-[0.17em] text-crimson-600 uppercase ${
            locale === "ar" ? "text-[13px]" : "text-[10px]"
          }`}>
            {t(isBoard ? "AAAA leadership" : "Regional representation")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950">
            {t(isBoard ? "AAAA Group Board" : "AAAA Group Members")}
          </h2>
        </div>
        <span className="rounded-xl border border-ink-100 bg-white px-4 py-2 font-display text-[11px] font-semibold text-ink-500">
          {people.length} {t(isBoard ? "board members" : "members")}
        </span>
      </div>

      <PeopleCardGrid
        people={people}
        imageDirectory="/images/aaaa-group/members"
        className="mt-7"
      />
    </section>
  );
}

function WebinarsPanel({ archiveData }: { archiveData: Parameters<typeof AaaaWebinarLibrary>[0]["archiveData"] }) {
  const { locale, t } = useTranslations();
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className={`font-display font-semibold tracking-[0.17em] text-crimson-600 uppercase ${
            locale === "ar" ? "text-[13px]" : "text-[10px]"
          }`}>
            {t("Educational archive")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950">
            {t("AAAA Past Webinars")}
          </h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-ink-500">
            {t("Browse every recorded session and questions-and-answers segment from the group's 20 archived webinars.")}
          </p>
        </div>
        <div className="flex items-end gap-3 border-l border-ink-200 pl-5">
          <span className="font-display text-4xl font-semibold leading-none tracking-[-0.05em] text-jade-700">
            {archiveData.videos.length}
          </span>
          <span className="pb-0.5 font-display text-[9px] font-semibold leading-4 tracking-[0.12em] text-ink-400 uppercase">
            {t("Video recordings")}
          </span>
        </div>
      </div>

      <AaaaWebinarLibrary archiveData={archiveData} />
    </section>
  );
}

export function AaaaGroupTabs({
  boardPeople,
  memberPeople,
  data,
  archiveData,
}: {
  boardPeople: DirectoryPerson[];
  memberPeople: DirectoryPerson[];
  data: typeof aaaaData;
  archiveData: Parameters<typeof AaaaWebinarLibrary>[0]["archiveData"];
}) {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div>
      <nav
        aria-label={t("AAAA Group page sections")}
        className="snap-x overflow-x-auto overflow-y-hidden border-b border-ink-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-w-max gap-6" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="aaaa-group-tabpanel"
              className={
                "-mb-px inline-flex min-h-14 snap-start cursor-pointer items-center gap-2 border-b-2 px-1 font-display text-[13px] font-semibold transition-colors sm:px-2 " +
                (activeTab === tab.id
                  ? "border-crimson-600 text-crimson-700"
                  : "border-transparent text-ink-500 hover:border-ink-200 hover:text-ink-900")
              }
            >
              {tab.id === "members" ? <Users className="size-4" /> : null}
              {tab.id === "webinars" ? (
                <CalendarDays className="size-4" />
              ) : null}
              {tab.id === "overview" ? <Globe className="size-4" /> : null}
              {tab.id === "board" ? <ArrowRight className="rtl-flip size-4" /> : null}
              {t(tab.label)}
              {tab.id === "board" ? (
                <span
                  className={
                    activeTab === tab.id ? "text-crimson-400" : "text-ink-300"
                  }
                >
                  {boardPeople.length}
                </span>
              ) : null}
              {tab.id === "members" ? (
                <span
                  className={
                    activeTab === tab.id ? "text-crimson-400" : "text-ink-300"
                  }
                >
                  {memberPeople.length}
                </span>
              ) : null}
              {tab.id === "webinars" ? (
                <span
                  className={
                    activeTab === tab.id ? "text-crimson-400" : "text-ink-300"
                  }
                >
                  {archiveData.events.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      <div id="aaaa-group-tabpanel" role="tabpanel" className="mt-6">
        {activeTab === "overview" ? <OverviewPanel data={data} memberCount={memberPeople.length} /> : null}
        {activeTab === "board" ? <PeoplePanel mode="board" people={boardPeople} /> : null}
        {activeTab === "members" ? <PeoplePanel mode="members" people={memberPeople} /> : null}
        {activeTab === "webinars" ? <WebinarsPanel archiveData={archiveData} /> : null}
      </div>
    </div>
  );
}
