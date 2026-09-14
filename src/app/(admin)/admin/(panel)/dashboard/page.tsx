import Image from "next/image";
import { AdminContent, AdminLink, AdminPageHeader, MetricCard, SectionCard, StatusPill, TextLink } from "@/components/admin/admin-ui";
import { BookOpen, CalendarDays, FileText, Globe, Users, Video } from "@/components/icons";
import { listAdminNewsArticlesAsync, listPublicNewsArticlesAsync } from "@/lib/admin-news-repository";
import { filterDeletedAdminRecordsAsync, getDeletedAdminRecordIdsAsync } from "@/lib/admin-deletion-repository";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { getManagedSigDirectoryAsync } from "@/lib/sig-directory-repository";
import { getManagedMemberCountriesAsync } from "@/lib/member-societies-repository";
import { getProfessionalResourcesAsync } from "@/lib/professional-resources-repository";
import { adminLandingPath, requireAdminSession } from "@/lib/admin-authorization";
import { getArlar27StatusesAsync } from "@/lib/arlar27-admin-repository";
import { arlar27GatewayCards } from "@/data/arlar27";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import { redirect } from "next/navigation";

type CollegeData = { events: Array<{ id: string; title: string; date: string; image: string; groups: string[] }> };

export default async function AdminDashboardPage() {
  const actor = await requireAdminSession();
  if (actor.role !== "owner") {
    const landingPath = adminLandingPath(actor);
    if (landingPath !== "/admin/dashboard") redirect(landingPath);
    return <><AdminPageHeader title="No module access" description="Your administrator account is active, but no management modules have been assigned yet." /><AdminContent><SectionCard title="Access required"><p className="p-6 text-sm leading-6 text-ink-600">Ask the primary administrator to assign at least one module from Access control.</p></SectionCard></AdminContent></>;
  }
  const [newsArticles, adminNewsArticles, collegeSource, doctorSource, sigSource, memberSource, deletedSocieties, resources, arlar27Statuses, arlar27Sections] = await Promise.all([
    listPublicNewsArticlesAsync(), listAdminNewsArticlesAsync(), listManagedCollegeEventsAsync("admin"), listManagedDoctorsAsync(), getManagedSigDirectoryAsync("admin"), getManagedMemberCountriesAsync(), getDeletedAdminRecordIdsAsync("member-societies"), getProfessionalResourcesAsync("admin"), getArlar27StatusesAsync("admin"), getPublishedSiteContent("arlar27", "gateway-cards", arlar27GatewayCards),
  ]);
  const [collegeEvents, doctors, sigs, memberCountries] = await Promise.all([
    filterDeletedAdminRecordsAsync("college-events", collegeSource as CollegeData["events"]),
    filterDeletedAdminRecordsAsync("doctors", doctorSource),
    filterDeletedAdminRecordsAsync("sigs", sigSource.map((group) => ({ ...group, id: group.slug }))),
    filterDeletedAdminRecordsAsync("member-countries", memberSource.map((country) => ({ ...country, id: country.slug }))),
  ]);
  const societyCount = memberCountries.reduce((total, country) => total + country.societies.filter((society) => !deletedSocieties.has(society.id)).length, 0);
  const libraryStats = { total: resources.length, collections: new Set(resources.map((resource) => resource.collection).filter(Boolean)).size };
  const completeDoctors = doctors.filter((doctor) => doctor.biography.length > 0 && !doctor.image.includes("placeholder")).length;
  const profileHealth = doctors.length ? Math.round((completeDoctors / doctors.length) * 100) : 0;
  const translationsToPrepare = adminNewsArticles.filter((article) => {
    const translations = article.draftRevision?.translations || article.translations;
    return !translations?.arabic.title.trim() || !translations.arabic.body.trim() || !translations.french.title.trim() || !translations.french.body.trim();
  }).length;
  const arlar27ReadyCount = arlar27Sections.filter((item) => {
    const key = item.href.split("/").at(-1) || "overview";
    return arlar27Statuses[key] === "ready";
  }).length;
  const arlar27AwaitingRelease = Math.max(0, arlar27Sections.length - arlar27ReadyCount);
  const arlar27Readiness = arlar27Sections.length ? Math.round((arlar27ReadyCount / arlar27Sections.length) * 100) : 0;

  return (
    <>
      <AdminPageHeader eyebrow="Executive workspace" title="Hello, ArLAR." description="A clear view of the network’s content, people, and programmes—plus the next work that needs your attention." actions={<><AdminLink href="/admin/news" variant="secondary">Review newsroom</AdminLink><AdminLink href="/admin/news">Create news post</AdminLink></>} />
      <AdminContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Published stories" value={newsArticles.length} note="Complete news archive" icon={<FileText className="h-5 w-5" />} tone="dark" />
          <MetricCard label="Unified doctors" value={doctors.length} note={`${profileHealth}% profile completeness`} icon={<Users className="h-5 w-5" />} tone="light" />
          <MetricCard label="College webinars" value={collegeEvents.length} note="Across the replay catalogue" icon={<Video className="h-5 w-5" />} tone="green" />
          <MetricCard label="Library resources" value={libraryStats.total} note={`${libraryStats.collections} curated collections`} icon={<BookOpen className="h-5 w-5" />} tone="red" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <SectionCard title="Editorial pulse" description="The latest stories currently visible on the public website." action={<TextLink href="/admin/news">Open newsroom</TextLink>}>
            <div className="divide-y divide-[#edf0f2]">
              {newsArticles.slice(0, 5).map((article, index) => <div key={article.id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><Image src={article.image} alt="" width={72} height={52} className="h-13 w-18 shrink-0 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><StatusPill tone="green">Live</StatusPill><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">{article.dateLabel}</span></div><p className="mt-1.5 line-clamp-1 text-sm font-semibold text-ink-900">{article.title}</p></div><span className="hidden text-xs font-medium text-ink-400 sm:block">0{index + 1}</span></div>)}
            </div>
          </SectionCard>

          <SectionCard title="Attention centre" description="Priority checks before the next publishing cycle.">
            <div className="space-y-3 p-5 sm:p-6">
              {[
                { label: "Doctor records need richer bios", value: doctors.length - completeDoctors, tone: "amber" as const, href: "/admin/doctors" },
                { label: "News translations to prepare", value: translationsToPrepare, tone: "red" as const, href: "/admin/news" },
                { label: "ArLAR27 sections awaiting release", value: arlar27AwaitingRelease, tone: "blue" as const, href: "/admin/arlar27" },
              ].map((item) => <a key={item.label} href={item.href} className="group flex items-center gap-3 rounded-xl border border-[#e7eaed] p-3.5 transition hover:border-ink-300 hover:bg-ink-50"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-sm font-bold text-ink-900">{item.value}</span><p className="min-w-0 flex-1 text-xs font-semibold leading-5 text-ink-700">{item.label}</p><StatusPill tone={item.tone}>Review</StatusPill></a>)}
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SectionCard title="Network at a glance" description="Live structural records across ArLAR."><div className="grid grid-cols-3 gap-px bg-[#edf0f2]"><div className="bg-white p-5"><Globe className="h-5 w-5 text-jade-600" /><p className="mt-4 text-2xl font-semibold">{memberCountries.length}</p><p className="mt-1 text-[11px] text-ink-500">Countries</p></div><div className="bg-white p-5"><Users className="h-5 w-5 text-crimson-600" /><p className="mt-4 text-2xl font-semibold">{societyCount}</p><p className="mt-1 text-[11px] text-ink-500">Societies</p></div><div className="bg-white p-5"><CalendarDays className="h-5 w-5 text-sky-600" /><p className="mt-4 text-2xl font-semibold">{sigs.length}</p><p className="mt-1 text-[11px] text-ink-500">SIGs</p></div></div></SectionCard>
          <SectionCard title="ArLAR27 readiness" description="Congress content is taking shape."><div className="p-5"><div className="flex items-end justify-between"><div><p className="text-3xl font-semibold tracking-[-0.04em] text-ink-950">{arlar27Readiness}%</p><p className="mt-1 text-xs text-ink-500">Launch readiness</p></div><StatusPill tone={arlar27AwaitingRelease === 0 ? "green" : "amber"}>{arlar27AwaitingRelease === 0 ? "Ready" : "In progress"}</StatusPill></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-[linear-gradient(90deg,#c10230,#00953b)]" style={{ width: `${arlar27Readiness}%` }} /></div><div className="mt-5"><TextLink href="/admin/arlar27">Manage congress</TextLink></div></div></SectionCard>
          <SectionCard title="Quick actions" description="Jump straight into common work."><div className="grid grid-cols-2 gap-2 p-4">{[{label:'New article',href:'/admin/news'},{label:'Find a doctor',href:'/admin/doctors'},{label:'Schedule webinar',href:'/admin/college/new'},{label:'Check inbox',href:'/admin/inbox'}].map((item) => <a key={item.label} href={item.href} className="rounded-xl border border-[#e5e8eb] p-3 text-xs font-semibold text-ink-700 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700">{item.label}</a>)}</div></SectionCard>
        </div>
      </AdminContent>
    </>
  );
}
