import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/page-hero";
import { SigProfileTabs } from "@/components/special-interest-groups/sig-profile-tabs";
import { sigProfiles } from "@/data/sig-profiles";
import { canonicalizeSigProfile } from "@/data/doctor-database";
import { filterDeletedAdminRecordsAsync, isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { getManagedSigAsync, getManagedSigProfileAsync } from "@/lib/sig-directory-repository";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamicParams = false;

type SigPageProps = { params: Promise<{ lang: Locale; slug: string }> };

const sigLogoFrames = {
  francophone: "wide",
  research: "wide",
  registry: "ultrawide",
  "women-health-rheumatology": "wide",
  "young-rheumatologists": "landscape",
} as const;

export function generateStaticParams() {
  return sigProfiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({
  params,
}: SigPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const [profile, group, deleted] = await Promise.all([
    getManagedSigProfileAsync(slug),
    getManagedSigAsync(slug),
    isAdminRecordDeletedAsync("sigs", slug),
  ]);

  return profile && group?.visible && !deleted
    ? buildLocalizedMetadata({
        locale: lang,
        path: `/special-interest-groups/${slug}`,
        title: group.name,
        description: profile.description,
      })
    : {};
}

export default async function SpecialInterestGroupProfilePage({
  params,
}: SigPageProps) {
  const { lang, slug } = await params;
  const t = (source: string) => translate(lang, source);
  const [sourceProfile, group, deleted, collegeEvents, doctors] = await Promise.all([
    getManagedSigProfileAsync(slug),
    getManagedSigAsync(slug),
    isAdminRecordDeletedAsync("sigs", slug),
    listManagedCollegeEventsAsync(),
    listManagedDoctorsAsync(),
  ]);

  if (!sourceProfile || !group?.visible || deleted) notFound();
  const activeDoctors = await filterDeletedAdminRecordsAsync("doctors", doctors);
  const profile = canonicalizeSigProfile({ ...sourceProfile, name: group.name, abbreviation: group.abbreviation, logo: group.logo }, activeDoctors);

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "Special Interest Groups", href: "/special-interest-groups" },
        ]}
        title={profile.name}
        description={profile.description}
        grainId={`sig-${profile.slug}-grain`}
        heroLogo={{
          src: profile.logo,
          alt: `${t(profile.name)} ${t("logo")}`,
          frame: sigLogoFrames[profile.slug as keyof typeof sigLogoFrames] ?? "square",
        }}
        compactTitle
      />

      <section className="relative overflow-hidden bg-[#f5f8f7] py-10 lg:py-12">
        <div aria-hidden className="absolute -left-40 top-24 size-80 rounded-full bg-crimson-50 blur-3xl" />
        <div aria-hidden className="absolute -right-40 bottom-28 size-80 rounded-full bg-jade-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SigProfileTabs profile={profile} collegeEvents={collegeEvents.filter((event): event is typeof event & { id: string } => event.status !== "draft" && Boolean(event.id)) as import("@/components/college/events-directory").CollegeEvent[]} />
        </div>
      </section>
    </main>
  );
}
