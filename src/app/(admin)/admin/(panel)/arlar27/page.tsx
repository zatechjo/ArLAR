import { CalendarDays, Check, Eye, FileText, Globe, Users } from "lucide-react";
import Image from "next/image";

import { Arlar27AdminHeader } from "@/components/admin/arlar27-admin-header";
import { Arlar27SectionList } from "@/components/admin/arlar27-status";
import { AdminContent, AdminLink, MetricCard, SectionCard, StatusPill } from "@/components/admin/admin-ui";
import { arlar27, arlar27Days, arlar27GatewayCards } from "@/data/arlar27";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { getArlar27StatusesAsync, getManagedArlar27ExternalAsync, getManagedArlar27PeopleAsync } from "@/lib/arlar27-admin-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

const adminRoutes: Record<string, string> = {
  "/congresses/arlar27/welcome": "/admin/arlar27/welcome",
  "/congresses/arlar27/committee": "/admin/arlar27/committee",
  "/congresses/arlar27/faculty": "/admin/arlar27/faculty",
  "/congresses/arlar27/abstracts": "/admin/arlar27/abstracts",
  "/congresses/arlar27/registration": "/admin/arlar27/registration",
  "/congresses/arlar27/programme": "/admin/arlar27/programme",
  "/congresses/arlar27/about-iraq": "/admin/arlar27/about-iraq",
};

export default async function AdminArlar27Page() {
  const [statuses, committeeSource, facultySource, abstracts, registration, congress, days, gatewayCards] = await Promise.all([
    getArlar27StatusesAsync("admin"), getManagedArlar27PeopleAsync("committee", "admin"), getManagedArlar27PeopleAsync("faculty", "admin"), getManagedArlar27ExternalAsync("abstracts", "admin"), getManagedArlar27ExternalAsync("registration", "admin"),
    getPublishedSiteContent("arlar27", "overview", arlar27), getPublishedSiteContent("arlar27", "days", arlar27Days), getPublishedSiteContent("arlar27", "gateway-cards", arlar27GatewayCards),
  ]);
  const readiness = Math.round(Object.values(statuses).filter((status) => status === "ready").length / gatewayCards.length * 100);
  const [committee, faculty] = await Promise.all([
    filterDeletedAdminRecordsAsync("arlar27-committee", committeeSource), filterDeletedAdminRecordsAsync("arlar27-faculty", facultySource),
  ]);

  return (
    <>
      <Arlar27AdminHeader
        title="ArLAR27 control room"
        description="Manage the ArLAR27 congress website."
        actions={<AdminLink href="/congresses/arlar27" variant="secondary"><Eye size={15} />Preview congress</AdminLink>}
      />
      <AdminContent>
        <section className="relative overflow-hidden rounded-3xl bg-[#061c31] text-white">
          <Image src={congress.saveTheDateImage} alt="" fill className="object-cover object-center opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#061c31_25%,rgba(6,28,49,.72),rgba(6,28,49,.92))]" />
          <div className="relative grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_420px] xl:p-10">
            <div>
              <div className="flex items-center gap-3">
                <Image src={congress.logo} alt="ArLAR27" width={70} height={70} className="size-14 rounded-xl bg-white object-contain p-1.5" />
                <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e5bd52]">Congress workspace</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em]">{congress.title}</h2></div>
              </div>
              <p className="mt-6 max-w-xl text-sm leading-6 text-slate-300">{congress.theme} · {congress.dates} · {congress.location}</p>
              <div className="mt-7 flex flex-wrap gap-2"><StatusPill tone="amber">Pre-launch</StatusPill><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300">7 congress sections</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300">4 programme days</span></div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Launch readiness</p><p className="mt-2 text-4xl font-semibold">{readiness}%</p></div><CalendarDays className="size-8 text-[#e5bd52]" /></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[linear-gradient(90deg,#e5bd52,#00953b)]" style={{ width: `${readiness}%` }} /></div>
              <p className="mt-4 text-xs leading-5 text-slate-400">Core pages are ready. Faculty, portal destinations, and the scientific programme still need confirmed data.</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Content sections" value={gatewayCards.length} note="Across the congress microsite" icon={<Globe className="size-5" />} tone="dark" />
          <MetricCard label="Committee members" value={committee.length} note="Linked doctor records" icon={<Users className="size-5" />} tone="light" />
          <MetricCard label="Faculty" value={faculty.length} note="Confirmed profiles" icon={<Users className="size-5" />} tone="green" />
          <MetricCard label="Programme days" value={days.length} note="Awaiting session details" icon={<FileText className="size-5" />} tone="red" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <SectionCard title="Congress sections" description="Open a section to manage its public content.">
            <Arlar27SectionList sections={gatewayCards.map((item) => { const key = item.href.split("/").at(-1) || "overview"; return { key, index: item.index, title: item.title, description: item.description, href: adminRoutes[item.href], initialStatus: statuses[key] || "waiting" }; })} />
          </SectionCard>

          <SectionCard title="Launch checklist" description="Key content needed before registration opens.">
            <div className="space-y-2 p-5">
              {[
                ["Congress identity and dates", true],
                ["Welcome message", true],
                ["Congress committee", committee.length > 0],
                ["Faculty roster", faculty.length > 0],
                ["Abstract destination", abstracts.enabled && Boolean(abstracts.url)],
                ["Registration destination", registration.enabled && Boolean(registration.url)],
                ["Scientific programme", false],
              ].map(([label, done]) => (
                <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-[#e8ebee] p-3">
                  <span className={`flex size-6 items-center justify-center rounded-md ${done ? "bg-jade-50 text-jade-700" : "bg-ink-50 text-ink-300"}`}>{done ? <Check className="size-3.5" /> : "·"}</span>
                  <span className={`text-xs font-medium ${done ? "text-ink-700" : "text-ink-500"}`}>{label}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </AdminContent>
    </>
  );
}
