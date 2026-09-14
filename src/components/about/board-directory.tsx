"use client";

import { useRef, useState } from "react";

import { CountryLabel } from "@/components/about/country-label";
import { CountryFlag } from "@/components/about/country-flag";
import { DoctorAvatar } from "@/components/about/doctor-avatar";
import { DoctorBiographyModal } from "@/components/about/doctor-biography-modal";
import { FittedCardName } from "@/components/about/fitted-card-name";
import { formatDoctorName } from "@/lib/doctor-name";
import { resolvePortraitSrc } from "@/lib/portrait-fit";
import { ArrowRight } from "@/components/icons";
import { formatBiographyPreview } from "@/lib/biography";
import type { DoctorAppearance, DoctorBiographyProfile } from "@/data/doctor-types";
import { useTranslations } from "@/i18n/locale-context";

export type BoardMember = {
  doctorId?: string;
  id: string;
  slug: string;
  sortOrder: number;
  group: "executive-council" | "board-members";
  fullName: string;
  nameAr?: string;
  nameFr?: string;
  credentials?: string;
  displayRole: string;
  countryName: string;
  countryCode: string;
  flagFilename: string;
  bio: string[];
  biographyAr?: string[];
  biographyFr?: string[];
  imageFilename: string;
  imagePosition?: string;
  appearances?: DoctorAppearance[];
};

type BoardDirectoryProps = {
  people: BoardMember[];
};

const BOARD_IMAGE_DIRECTORY = "/images/board";

const portraitFocalPoints: Record<string, string> = {
  "hebah-al-hajeri": "50% 0%",
};

function toBiographyProfile(member: BoardMember): DoctorBiographyProfile {
  return {
    id: member.id,
    fullName: member.fullName,
    nameAr: member.nameAr,
    nameFr: member.nameFr,
    credentials: member.credentials,
    displayRole: member.displayRole,
    showRole: member.group === "executive-council",
    countryName: member.countryName,
    flagFilename: member.flagFilename,
    bio: member.bio,
    biographyAr: member.biographyAr,
    biographyFr: member.biographyFr,
    imageSrc: resolvePortraitSrc(member.imageFilename, BOARD_IMAGE_DIRECTORY),
    imagePosition: member.imagePosition ?? portraitFocalPoints[member.slug],
  };
}

export function BoardDirectory({ people }: BoardDirectoryProps) {
  const executiveCouncil = people.filter(
    (person) => person.group === "executive-council",
  );
  const boardMembers = people.filter(
    (person) => person.group === "board-members",
  );
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(
    null,
  );
  const triggerRef = useRef<HTMLElement | null>(null);

  const openBiography = (member: BoardMember) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setSelectedMember(member);
  };

  const closeBiography = () => {
    setSelectedMember(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <section
        id="executive-council"
        className="relative scroll-mt-48 overflow-hidden bg-white py-20 lg:py-28"
      >
        <div
          aria-hidden
          className="absolute -left-24 top-28 size-72 rounded-full bg-crimson-50/80 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-36 top-16 size-[28rem] rounded-full border border-ink-100"
        />
        <div
          aria-hidden
          className="absolute -right-24 top-28 size-[20rem] rounded-full border border-crimson-100/70"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Executive Council"
            title="Leadership at the heart of ArLAR."
            description="The Executive Council guides ArLAR’s regional direction, scientific priorities, and work across its member societies."
            count={executiveCouncil.length}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {executiveCouncil.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onOpen={openBiography}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="board-members"
        className="relative scroll-mt-48 overflow-hidden border-b border-ink-100 bg-[#e6edef] pb-20 pt-32 lg:pb-28 lg:pt-40"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.62),transparent_42%),radial-gradient(circle_at_8%_8%,rgba(193,2,48,0.1),transparent_25%),radial-gradient(circle_at_94%_82%,rgba(15,23,42,0.09),transparent_28%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.11)_1px,transparent_0)] opacity-30 [background-size:28px_28px] [mask-image:linear-gradient(115deg,black,transparent_56%,black)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-[1] h-24 sm:h-28 lg:h-32"
        >
          <svg
            className="size-full"
            viewBox="0 0 1440 128"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0 0H1440V33C1188 92 992 78 754 45C520 13 307 93 0 51V0Z"
              fill="white"
            />
            <path
              d="M0 51C307 93 520 13 754 45C992 78 1188 92 1440 33"
              stroke="rgba(193,2,48,0.28)"
              strokeWidth="1.5"
            />
            <path
              d="M0 60C307 102 520 22 754 54C992 87 1188 101 1440 42"
              stroke="rgba(15,23,42,0.12)"
            />
            <circle cx="278" cy="82" r="4" fill="rgba(193,2,48,0.34)" />
            <circle cx="1118" cy="78" r="3.5" fill="rgba(15,23,42,0.2)" />
          </svg>
        </div>
        <div
          aria-hidden
          className="absolute -right-32 top-48 size-[31rem] rounded-full border border-ink-300/30"
        >
          <span className="absolute inset-16 rounded-full border border-crimson-300/35" />
          <span className="absolute inset-32 rounded-full border border-white/80" />
        </div>
        <svg
          aria-hidden
          className="absolute -left-16 top-56 size-80 text-ink-900 opacity-[0.035]"
          viewBox="0 0 320 320"
          fill="none"
        >
          <path
            d="M160 18 283 89v142l-123 71L37 231V89L160 18Z"
            stroke="currentColor"
          />
          <circle cx="160" cy="160" r="74" stroke="currentColor" />
          <circle cx="160" cy="160" r="7" fill="currentColor" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Board Members"
            title="One board. Shared purpose."
            description="Board members bring the voices, expertise, and priorities of rheumatology communities from across the Arab region."
            count={boardMembers.length}
            singleLine
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boardMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onOpen={openBiography}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedMember ? (
        <DoctorBiographyModal
          doctor={toBiographyProfile(selectedMember)}
          onClose={closeBiography}
        />
      ) : null}
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  count,
  singleLine = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  singleLine?: boolean;
}) {
  const { t } = useTranslations();
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-crimson-600" />
          <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-ink-500 uppercase">
            {t(eyebrow)}
          </p>
        </div>
        <h2
          className={`mt-5 font-display font-semibold leading-[1.08] tracking-[-0.035em] text-ink-950 ${
            singleLine
              ? "max-w-none whitespace-nowrap text-[clamp(1.65rem,5.7vw,3rem)]"
              : "max-w-3xl text-4xl sm:text-5xl"
          }`}
        >
          {t(title)}
        </h2>
        <p className="mt-5 max-w-2xl text-[14px] leading-7 text-ink-500 sm:text-[15px]">
          {t(description)}
        </p>
      </div>

      <div className="flex items-end gap-3 border-l border-ink-200 pl-5">
        <span className="font-display text-5xl font-semibold leading-none tracking-[-0.06em] text-crimson-600">
          {String(count).padStart(2, "0")}
        </span>
        <span className="pb-1 font-display text-[10px] font-semibold leading-4 tracking-[0.12em] text-ink-400 uppercase">
          {t("Regional leaders")}
        </span>
      </div>
    </div>
  );
}

function MemberCard({
  member,
  featured = false,
  onOpen,
}: {
  member: BoardMember;
  featured?: boolean;
  onOpen: (member: BoardMember) => void;
}) {
  const { locale, t } = useTranslations();
  const isArabicProfile = locale === "ar" && Boolean(member.nameAr);
  // A published French bio is already French, so it must not go through t().
  const isFrenchBio = locale === "fr" && Boolean(member.biographyFr?.length);
  const localisedName = isArabicProfile
    ? member.nameAr!
    : (locale === "fr" && member.nameFr) || formatDoctorName(member.fullName);
  const showRole = member.group === "executive-council";
  const biography = locale === "ar" && member.biographyAr?.length
    ? member.biographyAr
    : isFrenchBio
      ? member.biographyFr!
      : member.bio;
  const hasBiography = biography.length > 0;
  const biographyPreview = hasBiography
    ? formatBiographyPreview(biography)
    : t("Professional biography coming soon.");
  const imageSrc = resolvePortraitSrc(member.imageFilename, BOARD_IMAGE_DIRECTORY);

  return (
    <article
      className={`group relative flex ${
        showRole ? "min-h-[25.75rem]" : "min-h-96"
      } flex-col overflow-hidden rounded-[1.75rem] border p-6 transition-[transform,translate,scale,border-color,box-shadow] duration-[650ms] ease-in-out hover:-translate-y-2 hover:scale-[1.01] sm:p-7 ${
        featured
          ? "border-crimson-800 bg-[#850020] text-white shadow-xl shadow-crimson-950/16"
          : "border-ink-100 bg-white text-ink-950 hover:border-crimson-200 hover:shadow-xl hover:shadow-ink-950/7"
      }`}
    >
      <div className="flex items-start justify-between gap-5">
        <DoctorAvatar
          imageSrc={imageSrc}
          name={localisedName}
          imagePosition={member.imagePosition ?? portraitFocalPoints[member.slug] ?? "50% 35%"}
          className={`size-32 shrink-0 rounded-full ring-1 sm:size-36 ${featured ? "bg-white ring-white/30" : "bg-ink-50 ring-ink-100"}`}
          fallbackClassName={featured ? "bg-white/15 text-white ring-white/30" : "bg-[#071421] text-white ring-[#071421]"}
          imageClassName="transition-[transform,scale] duration-700 ease-out group-hover:scale-[1.025]"
        />

        <div className="flex min-w-0 flex-col items-end gap-0 text-right">
          <CountryFlag
            filename={member.flagFilename}
          />
          <CountryLabel
            countryName={member.countryName}
            className={`${featured ? "text-white/70" : "text-ink-400"} mt-1`}
          />
        </div>
      </div>

      <div className="relative mt-6 flex flex-1 flex-col">
        <FittedCardName
          name={localisedName}
          className={featured ? "text-white" : "text-ink-950"}
        />
        {showRole ? (
          <p
            className={`mt-1.5 font-display text-[12px] font-semibold tracking-[0.04em] ${
              featured ? "text-crimson-100" : "text-crimson-600"
            }`}
          >
            {t(member.displayRole)}
          </p>
        ) : null}

        <p
          className={`${showRole ? "mt-4" : "mt-3"} min-h-12 overflow-hidden text-[13px] leading-6 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] ${
            featured ? "text-white/68" : "text-ink-500"
          }`}
        >
          {hasBiography && !isArabicProfile && !isFrenchBio ? t(biographyPreview) : biographyPreview}
        </p>

        <div
          className={`mt-auto border-t pt-5 ${
            featured ? "border-white/15" : "border-ink-100"
          }`}
        >
          {hasBiography ? (
            <button
              type="button"
              onClick={() => onOpen(member)}
              className={`group/button inline-flex cursor-pointer items-center gap-2 font-display text-[12px] font-semibold underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] ${
                featured
                  ? "text-white hover:decoration-white/60"
                  : "text-ink-900 hover:text-crimson-700 hover:decoration-crimson-400"
              }`}
            >
              {t("View biography")}
              <ArrowRight
                className={`rtl-flip size-4 transition-[transform,translate] duration-200 ease-out group-hover/button:translate-x-1.5 ${
                  featured ? "text-crimson-200" : "text-crimson-600"
                }`}
              />
            </button>
          ) : (
            <span
              className={`font-display text-[11px] font-medium ${
                featured ? "text-white/45" : "text-ink-400"
              }`}
            >
              {t("Coming soon")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
