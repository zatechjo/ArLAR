import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { getDeletedAdminRecordIdsAsync } from "@/lib/admin-deletion-repository";
import { getManagedSigDirectoryAsync } from "@/lib/sig-directory-repository";
import { localizePath, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

const groupDefinitions = [
  {
    slug: "arab-adult-arthritis-awareness",
    short: "AAAA",
    name: "Arab Adult Arthritis Awareness Group",
    focus: "Arabic patient education",
    logo: "/images/special-interest-groups/aaaa.png",
  },
  {
    slug: "francophone",
    short: "FR",
    name: "ArLAR Francophone Group",
    focus: "French-speaking network",
    logo: "/images/special-interest-groups/francophone.jpg",
  },
  {
    slug: "musculoskeletal-sonography",
    short: "MSUS",
    name: "ArLAR Musculoskeletal Sonography Group",
    focus: "Ultrasound training & standards",
    logo: "/images/special-interest-groups/musculoskeletal-sonography.png",
  },
  {
    slug: "pediatric-rheumatology",
    short: "PRAG",
    name: "Pediatric Rheumatologist Arab Group",
    focus: "Pediatric care & research",
    logo: "/images/special-interest-groups/pediatric-rheumatology.png",
  },
  {
    slug: "research",
    short: "ARCH",
    name: "ArLAR Research Group",
    focus: "Collaborative research",
    logo: "/images/special-interest-groups/arch.png",
  },
  {
    slug: "registry",
    short: "RArLAR",
    name: "Registry of ArLAR",
    focus: "Regional patient registries",
    logo: "/images/special-interest-groups/registry.jpg",
  },
  {
    slug: "arab-journal",
    short: "AJR",
    name: "Arab Journal of Rheumatology",
    focus: "Peer-reviewed publishing",
    logo: "/images/special-interest-groups/arab-journal.jpg",
  },
  {
    slug: "young-rheumatologists",
    short: "YRG",
    name: "Young Rheumatologist Group",
    focus: "Early-career development",
    logo: "/images/special-interest-groups/young-rheumatologists.jpeg",
  },
  {
    slug: "women-health-rheumatology",
    short: "WHrA",
    name: "Arab Women Health in Rheumatology Group",
    focus: "Women’s health & rheumatology",
    logo: "/images/special-interest-groups/women-health.jpg",
  },
] as const;

const laneRepeats = 3;

type HomeSigGroup = Awaited<ReturnType<typeof getManagedSigDirectoryAsync>>[number] & {
  focus: string;
};

function GroupCard({
  group,
  number,
  isDuplicate = false,
  locale,
}: {
  group: HomeSigGroup;
  number: number;
  isDuplicate?: boolean;
  locale: Locale;
}) {
  const t = (source: string) => translate(locale, source);
  return (
    <Link
      href={localizePath("/special-interest-groups/" + group.slug, locale)}
      dir={locale === "ar" ? "rtl" : "ltr"}
      tabIndex={isDuplicate ? -1 : undefined}
      className="group/card relative flex h-[166px] w-[21rem] shrink-0 cursor-pointer items-center gap-5 overflow-hidden rounded-[1.4rem] border border-ink-100 bg-white p-5 transition-[border-color,background-color,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-jade-200 hover:bg-jade-50/30"
    >
      <span
        aria-hidden
        className="absolute -right-12 -top-12 size-32 rounded-full border-[18px] border-jade-50 transition-transform duration-500 group-hover/card:scale-110"
      />
      <span className="relative grid h-[5.25rem] w-[5.75rem] shrink-0 place-items-center overflow-hidden rounded-2xl border border-ink-100 bg-white p-2.5">
        <span className="relative size-full">
          <Image
            src={group.logo}
            alt=""
            fill
            sizes="92px"
            className="object-contain transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
          />
        </span>
      </span>
      <span className="relative min-w-0">
        <small className="block font-display text-[9px] font-semibold leading-[1.05] tracking-[0.15em] text-crimson-600 uppercase">
          {String(number + 1).padStart(2, "0")} · {t(group.focus)}
        </small>
        <strong className="mt-2 block max-w-[13rem] font-display text-[15px] font-semibold leading-snug text-ink-950">
          {t(group.name)}
        </strong>
      </span>
      <ArrowUpRight className="absolute bottom-4 right-4 size-4 text-ink-300 transition-all group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-jade-700" />
    </Link>
  );
}

export async function SpecialInterestGroupsSection({ locale = "en" }: { locale?: Locale }) {
  const t = (source: string) => translate(locale, source);
  const [directory, deleted] = await Promise.all([getManagedSigDirectoryAsync(), getDeletedAdminRecordIdsAsync("sigs")]);
  const groups = directory
    .filter((group) => group.visible && !deleted.has(group.slug))
    .map((group) => ({
      ...group,
      focus:
        groupDefinitions.find((definition) => definition.slug === group.slug)?.focus ??
        "Specialist collaboration",
    }));
  const splitAt = Math.ceil(groups.length / 2);
  const lanes = [groups.slice(0, splitAt), groups.slice(splitAt)].filter(
    (lane) => lane.length > 0,
  );
  // The animation track is deliberately LTR so translateX(-50%) is seamless.
  // Reverse only the Arabic display sequence so the first group sits on the
  // right and the lane advances naturally toward the left.
  const displayLanes = locale === "ar"
    ? lanes.map((lane) => [...lane].reverse())
    : lanes;

  if (groups.length === 0) return null;

  return (
    <section
      id="special-interest-groups"
      className="relative isolate overflow-hidden bg-[#f5f8f8] py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(193,2,48,0.055),transparent_24%),radial-gradient(circle_at_92%_80%,rgba(0,149,59,0.07),transparent_27%)]"
      />
      <svg
        aria-hidden
        className="absolute right-[-8rem] top-10 size-[32rem] text-jade-700 opacity-[0.045]"
        viewBox="0 0 500 500"
        fill="none"
      >
        <circle cx="250" cy="250" r="180" stroke="currentColor" />
        <circle cx="250" cy="250" r="120" stroke="currentColor" />
        <circle cx="250" cy="250" r="55" stroke="currentColor" />
        <path d="M250 70V430M70 250H430" stroke="currentColor" />
        <circle cx="250" cy="70" r="8" fill="currentColor" />
        <circle cx="430" cy="250" r="8" fill="currentColor" />
        <circle cx="250" cy="430" r="8" fill="currentColor" />
        <circle cx="70" cy="250" r="8" fill="currentColor" />
      </svg>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                {t("Nine focused communities")}
              </p>
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-5xl">
              {t("Find the group that moves your work forward.")}
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-ink-500">
              {t("From research and registries to mentorship and focused clinical practice, ArLAR's groups turn shared interests into regional progress.")}
            </p>
          </div>

          <div className="flex items-end gap-5">
            <div className="hidden border-r border-ink-200 pr-5 text-right sm:block">
              <strong className="block font-display text-3xl font-semibold leading-none text-ink-950">
                {String(groups.length).padStart(2, "0")}
              </strong>
              <span className="mt-1.5 block text-[10px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
                {t("Active groups")}
              </span>
            </div>
            <Link
              href={localizePath("/special-interest-groups", locale)}
              className="group inline-flex items-center gap-2 font-display text-[13px] font-semibold text-ink-800 transition-colors hover:text-jade-700"
            >
              {t("Explore every group")}
              <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="group/sig relative z-10 mt-12 space-y-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-[#f5f8f8] to-transparent sm:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-[#f5f8f8] to-transparent sm:w-28"
        />

        {displayLanes.map((lane, laneIndex) => (
          <div
            key={laneIndex}
            dir="ltr"
            className="overflow-hidden"
            aria-label={
              laneIndex === 0
                ? t("Clinical and research groups")
                : t("Publishing, career, and community groups")
            }
          >
            <div
              dir="ltr"
              className="flex w-max motion-safe:animate-marquee motion-reduce:translate-x-0 group-hover/sig:[animation-play-state:paused] group-focus-within/sig:[animation-play-state:paused]"
              style={{
                animationDuration: "110s",
                animationDirection: "normal",
              }}
            >
              {[0, 1].map((segmentCopy) => (
                <div
                  key={segmentCopy}
                  aria-hidden={segmentCopy === 1}
                  className="flex shrink-0 gap-4 pr-4"
                >
                  {Array.from({ length: laneRepeats }, (_, laneCopy) =>
                    lane.map((group) => {
                      const number = groups.indexOf(group);

                      return (
                        <GroupCard
                          key={`${segmentCopy}-${laneCopy}-${group.abbreviation}`}
                          group={group}
                          number={number}
                          locale={locale}
                          isDuplicate={segmentCopy === 1 || laneCopy > 0}
                        />
                      );
                    }),
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
