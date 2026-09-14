import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

import {
  BoardDirectory,
  type BoardMember,
} from "@/components/about/board-directory";
import boardData from "@/data/board-members.json";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { findManagedDoctorByName } from "@/lib/admin-doctor-repository";
import { listAssignedDoctorsAsync } from "@/lib/doctor-placement-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export const generateMetadata = createStaticPageMetadata("/about/board");

export default async function BoardOfDirectorsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const href = (path: string) => localizePath(path, lang);
  const [managedBoard, assignedDoctors] = await Promise.all([
    getPublishedSiteContent("people", "board", boardData),
    listAssignedDoctorsAsync("board-of-directors"),
  ]);
  const sourcePeople = managedBoard.people;
  const people: BoardMember[] = assignedDoctors.map(({ doctor, placement }, index) => {
    const person = sourcePeople.find((candidate) => findManagedDoctorByName([doctor], candidate.name));
    const group: BoardMember["group"] = placement.section.toLowerCase().includes("executive")
      ? "executive-council"
      : "board-members";
    return {
      doctorId: doctor.id,
      id: doctor.id,
      slug: doctor.slug,
      sortOrder: person?.sortOrder ?? sourcePeople.length + index + 1,
      group,
      fullName: doctor.fullName,
      nameAr: doctor.nameAr, nameFr: doctor.nameFr,
      credentials: doctor.credentials,
      displayRole: placement.role || person?.displayRole || (group === "executive-council" ? "Executive Council Member" : "Board Member"),
      countryName: doctor.country,
      countryCode: doctor.countryCode,
      flagFilename: doctor.flagFilename,
      bio: doctor.biography,
      biographyAr: doctor.biographyAr, biographyFr: doctor.biographyFr,
      imageFilename: doctor.image,
      imagePosition: doctor.imagePosition,
      appearances: doctor.appearances,
    };
  })
  .sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <main>
      <section className="relative isolate min-h-[18rem] overflow-hidden bg-[#07131f] text-white sm:min-h-[19rem] lg:min-h-[20rem]">
        <Image
          src="/images/subpage-hero-medical.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="rtl-hero-mirror object-cover object-center opacity-[0.34]"
          style={{
            filter: "blur(2px) saturate(96%)",
            transform: "scale(1.02)",
          }}
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[linear-gradient(90deg,rgba(5,13,22,0.94)_0%,rgba(5,13,22,0.78)_43%,rgba(5,13,22,0.3)_74%,rgba(5,13,22,0.16)_100%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(193,2,48,0.22),transparent_27%),radial-gradient(circle_at_84%_70%,rgba(0,149,59,0.14),transparent_32%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] opacity-15 [background-size:24px_24px] [mask-image:linear-gradient(90deg,black,transparent_72%)]"
        />
        <svg
          aria-hidden
          className="absolute inset-0 size-full opacity-[0.07] mix-blend-soft-light"
          preserveAspectRatio="none"
        >
          <filter id="board-hero-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.78"
              numOctaves="3"
              seed="8"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#board-hero-grain)" />
        </svg>

        <div className="relative mx-auto flex min-h-[18rem] max-w-7xl flex-col justify-center px-4 py-9 sm:min-h-[19rem] sm:px-6 lg:min-h-[20rem]">
          <nav
            aria-label={t("Breadcrumb")}
            className="flex items-center gap-2.5 font-display text-[13px] font-medium text-white/60"
          >
            <Link href={href("/")} className="transition-colors hover:text-white">
              {t("Home")}
            </Link>
            <span aria-hidden className="text-white/25">
              /
            </span>
            <Link
              href={href("/about")}
              className="transition-colors hover:text-white"
            >
              {t("About Us")}
            </Link>
            <span aria-hidden className="text-white/25">
              /
            </span>
            <span className="text-white/85">{t("Board of Directors")}</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              {t("Board of Directors")}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-sky-50/72 sm:text-[16px]">
              {t("Regional leaders working together to advance rheumatology, science, and patient care across the Arab world.")}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-crimson-500 via-white/20 to-jade-400"
        />
      </section>

      <BoardDirectory people={people} />
    </main>
  );
}
