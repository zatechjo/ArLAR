"use client";

import { useEffect, useRef, useState } from "react";

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

export type DirectoryPerson = {
  doctorId?: string;
  id: string;
  slug: string;
  sortOrder: number;
  group: "leadership" | "members";
  fullName: string;
  nameAr?: string;
  nameFr?: string;
  credentials?: string;
  displayRole: string;
  countryName: string;
  flagFilename: string;
  bio: string[];
  biographyAr?: string[];
  biographyFr?: string[];
  imageFilename: string;
  imagePosition?: string;
  appearances?: DoctorAppearance[];
};

function toBiographyProfile(
  person: DirectoryPerson,
  imageDirectory: string,
): DoctorBiographyProfile {
  return {
    id: person.id,
    fullName: person.fullName,
    nameAr: person.nameAr,
    nameFr: person.nameFr,
    credentials: person.credentials,
    displayRole: person.displayRole,
    showRole: person.group === "leadership",
    countryName: person.countryName,
    flagFilename: person.flagFilename,
    bio: person.bio,
    biographyAr: person.biographyAr,
    biographyFr: person.biographyFr,
    imageSrc: resolvePortraitSrc(person.imageFilename, imageDirectory),
    imagePosition: person.imagePosition,
  };
}

type PeopleDirectoryProps = {
  people: DirectoryPerson[];
  imageDirectory: string;
  eyebrow: string;
  title: string;
  description: string;
  countLabel?: string;
};

export function PeopleDirectory({
  people,
  imageDirectory,
  eyebrow,
  title,
  description,
  countLabel = "Committee members",
}: PeopleDirectoryProps) {
  const [selectedPerson, setSelectedPerson] =
    useState<DirectoryPerson | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openBiography = (person: DirectoryPerson) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setSelectedPerson(person);
  };

  const closeBiography = () => {
    setSelectedPerson(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-100 bg-[#e6edef] py-20 lg:py-28">
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
          className="absolute -right-32 top-24 size-[31rem] rounded-full border border-ink-300/30"
        >
          <span className="absolute inset-16 rounded-full border border-crimson-300/35" />
          <span className="absolute inset-32 rounded-full border border-white/80" />
        </div>
        <svg
          aria-hidden
          className="absolute -left-16 top-44 size-80 text-ink-900 opacity-[0.035]"
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
          <DirectoryHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            count={people.length}
            countLabel={countLabel}
          />

          <div className="mt-12 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                imageDirectory={imageDirectory}
                onOpen={openBiography}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedPerson ? (
        <DoctorBiographyModal
          doctor={toBiographyProfile(selectedPerson, imageDirectory)}
          onClose={closeBiography}
        />
      ) : null}
    </>
  );
}

export function PeopleCardGrid({
  people,
  imageDirectory,
  className = "",
}: {
  people: DirectoryPerson[];
  imageDirectory: string;
  className?: string;
}) {
  const [selectedPerson, setSelectedPerson] =
    useState<DirectoryPerson | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openBiography = (person: DirectoryPerson) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setSelectedPerson(person);
  };

  const closeBiography = () => {
    setSelectedPerson(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <div
        className={`grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      >
        {people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            imageDirectory={imageDirectory}
            onOpen={openBiography}
          />
        ))}
      </div>

      {selectedPerson ? (
        <DoctorBiographyModal
          doctor={toBiographyProfile(selectedPerson, imageDirectory)}
          onClose={closeBiography}
        />
      ) : null}
    </>
  );
}

/**
 * A compact, autoplaying member showcase for landing pages. The initial order
 * is randomized in an effect so the server-rendered HTML remains deterministic
 * and hydration-safe.
 */
/**
 * -mx-2 / px-2 gives each card's 1px border and rounded corners room inside the
 * scrollport, which otherwise clips the leftmost card flush at the edge. The
 * negative margin keeps the cards aligned with the heading above, and
 * scroll-px-2 keeps snap-start landing on that same padded edge.
 */
const CAROUSEL_VIEWPORT_CLASS =
  "-mx-2 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-px-2 scroll-smooth px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function PeopleCarousel({
  people,
  imageDirectory,
  className = "",
}: {
  people: DirectoryPerson[];
  imageDirectory: string;
  className?: string;
}) {
  const { t } = useTranslations();
  const [orderedPeople, setOrderedPeople] = useState(people);
  const [selectedPerson, setSelectedPerson] = useState<DirectoryPerson | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setOrderedPeople(shufflePeople(people)), 0);
    return () => window.clearTimeout(timer);
  }, [people]);

  /**
   * Scrolls to a whole card index rather than adding to the current offset.
   * `scrollLeft` is fractional while a smooth scroll is still animating (and
   * after any manual drag), so `scrollLeft + step` lands between snap points
   * and the drift accumulates until the leftmost card is permanently clipped.
   */
  const scrollToCard = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.children.length === 0) return;
    const first = viewport.children[0] as HTMLElement;
    const second = viewport.children[1] as HTMLElement | undefined;
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    if (step <= 0) return;

    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    // floor, not ceil: the final card position is the last whole step that
    // still fits. Rounding up leaves an index the browser can never reach,
    // because it clamps scrollLeft to maxScroll.
    const lastIndex = Math.floor((maxScroll + 1) / step);
    const current = Math.round(viewport.scrollLeft / step);
    const next = Math.min(Math.max(current + direction, 0), lastIndex);
    viewport.scrollTo({ left: Math.min(next * step, maxScroll), behavior: "smooth" });
  };

  useEffect(() => {
    const advance = () => {
      const viewport = viewportRef.current;
      if (!viewport || pausedRef.current || document.hidden || viewport.children.length === 0) return;
      const first = viewport.children[0] as HTMLElement;
      const second = viewport.children[1] as HTMLElement | undefined;
      const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
      if (step <= 0) return;
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      if (maxScroll < 1) return;                       // everything already fits
      const lastIndex = Math.floor((maxScroll + 1) / step);
      const current = Math.round(viewport.scrollLeft / step);
      const next = current >= lastIndex ? 0 : current + 1;
      viewport.scrollTo({ left: Math.min(next * step, maxScroll), behavior: "smooth" });
    };

    const timer = window.setInterval(advance, 4800);
    return () => window.clearInterval(timer);
  }, [orderedPeople]);

  const scrollByCard = (direction: -1 | 1) => {
    scrollToCard(direction);
  };

  const openBiography = (person: DirectoryPerson) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setSelectedPerson(person);
  };

  const closeBiography = () => {
    setSelectedPerson(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <div
        className={`relative ${className}`}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onFocus={() => { pausedRef.current = true; }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) pausedRef.current = false;
        }}
      >
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={t("ArLAR College members")}
          className={CAROUSEL_VIEWPORT_CLASS}
        >
          {orderedPeople.map((person) => (
            <div key={person.id} className="min-w-[88%] snap-start sm:min-w-[calc((100%_-_1.25rem)/2)] lg:min-w-[calc((100%_-_2.5rem)/3)]">
              <PersonCard person={person} imageDirectory={imageDirectory} onOpen={openBiography} hoverEffect={false} />
            </div>
          ))}
        </div>

        {orderedPeople.length > 1 ? (
          <div className="mt-5 flex items-center justify-end gap-2">
            <button type="button" onClick={() => scrollByCard(-1)} aria-label={t("Previous members")} className="grid size-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:border-jade-300 hover:text-jade-700">
              <ArrowRight className="rtl-flip size-4 rotate-180" />
            </button>
            <button type="button" onClick={() => scrollByCard(1)} aria-label={t("Next members")} className="grid size-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:border-jade-300 hover:text-jade-700">
              <ArrowRight className="rtl-flip size-4" />
            </button>
          </div>
        ) : null}
      </div>

      {selectedPerson ? (
        <DoctorBiographyModal
          doctor={toBiographyProfile(selectedPerson, imageDirectory)}
          onClose={closeBiography}
        />
      ) : null}
    </>
  );
}

function shufflePeople(people: DirectoryPerson[]) {
  const shuffled = [...people];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function DirectoryHeading({
  eyebrow,
  title,
  description,
  count,
  countLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  countLabel: string;
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
        <h2 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink-950 sm:text-5xl">
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
        <span className="max-w-20 pb-1 font-display text-[10px] font-semibold leading-4 tracking-[0.12em] text-ink-400 uppercase">
          {t(countLabel)}
        </span>
      </div>
    </div>
  );
}

function PersonCard({
  person,
  imageDirectory,
  onOpen,
  hoverEffect = true,
}: {
  person: DirectoryPerson;
  imageDirectory: string;
  onOpen: (person: DirectoryPerson) => void;
  hoverEffect?: boolean;
}) {
  const { locale, t } = useTranslations();
  const isArabicProfile = locale === "ar" && Boolean(person.nameAr);
  // A published French bio is already French, so it must not go through t().
  const isFrenchBio = locale === "fr" && Boolean(person.biographyFr?.length);
  const localisedName = isArabicProfile
    ? person.nameAr!
    : (locale === "fr" && person.nameFr) || formatDoctorName(person.fullName);
  const biography = locale === "ar" && person.biographyAr?.length
    ? person.biographyAr
    : isFrenchBio
      ? person.biographyFr!
      : person.bio;
  const hasBiography = biography.length > 0;
  const showRole = person.group === "leadership";
  const biographyPreview = hasBiography
    ? formatBiographyPreview(biography)
    : t("Professional biography coming soon.");
  const imageSrc = resolvePortraitSrc(person.imageFilename, imageDirectory);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-ink-100 bg-white p-6 text-ink-950 ${hoverEffect ? "transition-[transform,translate,scale,border-color,box-shadow] duration-[650ms] ease-in-out hover:-translate-y-2 hover:scale-[1.01] hover:border-crimson-200 hover:shadow-xl hover:shadow-ink-950/7" : "transition-colors duration-300 hover:border-ink-200"} sm:p-7 ${
        showRole ? "min-h-[25.75rem]" : "min-h-96"
      }`}
    >
      <div className="flex items-start justify-between gap-5">
        <DoctorAvatar
          imageSrc={imageSrc}
          name={localisedName}
          imagePosition={person.imagePosition ?? "50% 30%"}
          className="size-32 shrink-0 rounded-full ring-1 ring-ink-100 sm:size-36"
          fallbackClassName="bg-[#071421] text-white ring-[#071421]"
          imageClassName="transition-[transform,scale] duration-700 ease-out group-hover:scale-[1.025]"
        />

        <div className="flex min-w-0 flex-col items-end gap-0 text-right">
          {person.flagFilename ? (
            <CountryFlag filename={person.flagFilename} />
          ) : null}
          <CountryLabel countryName={person.countryName} className="mt-1 text-ink-400" />
        </div>
      </div>

      <div className="relative mt-6 flex flex-1 flex-col">
          <FittedCardName name={localisedName} className="text-ink-950" />
        {showRole ? (
          <p className="mt-1.5 font-display text-[12px] font-semibold leading-5 tracking-[0.025em] text-crimson-600">
            {t(person.displayRole)}
          </p>
        ) : null}

        <p
          className={`min-h-12 overflow-hidden text-[13px] leading-6 text-ink-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] ${
            showRole ? "mt-4" : "mt-3"
          }`}
        >
          {hasBiography && !isArabicProfile && !isFrenchBio ? t(biographyPreview) : biographyPreview}
        </p>

        <div className="mt-auto border-t border-ink-100 pt-5">
          {hasBiography ? (
            <button
              type="button"
              onClick={() => onOpen(person)}
              className="group/button inline-flex cursor-pointer items-center gap-2 font-display text-[12px] font-semibold text-ink-900 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] hover:text-crimson-700 hover:decoration-crimson-400"
            >
              {t("View biography")}
              <ArrowRight className="rtl-flip size-4 text-crimson-600 transition-[transform,translate] duration-200 ease-out group-hover/button:translate-x-1.5" />
            </button>
          ) : (
            <span className="font-display text-[11px] font-medium text-ink-400">
              {t("Coming soon")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
