import { BookOpen, FileText, Globe } from "@/components/icons";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminContent, AdminLink, AdminPageHeader, MetricCard } from "@/components/admin/admin-ui";
import { ProfessionalResourcesManager } from "@/components/admin/professional-resources-manager";
import { getProfessionalResourcesAsync } from "@/lib/professional-resources-repository";

export default async function AdminProfessionalsPage() {
  const resources = await getProfessionalResourcesAsync("admin");
  const published = resources.filter((resource) => resource.status === "published").length;
  const bulletins = resources.filter((resource) => resource.kind === "bulletin").length;
  const partners = resources.filter((resource) => resource.kind === "partner").length;
  return <><AdminPageHeader title="Publications & resources" description="Manage publications and professional resources." actions={<><AdminRecycleBinLink scope="professional-resources" /><AdminLink href="/admin/professionals/new">+ Add resource</AdminLink></>} /><AdminContent><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Published resources" value={published} note={`${resources.length - published} currently in draft`} icon={<FileText className="h-5 w-5" />} tone="dark" /><MetricCard label="E-Bulletin issues" value={bulletins} note="Issues in the managed archive" icon={<BookOpen className="h-5 w-5" />} tone="light" /><MetricCard label="Partner resources" value={partners} note="External educational collaborations" icon={<Globe className="h-5 w-5" />} tone="green" /></div><div className="mt-6"><ProfessionalResourcesManager resources={resources} /></div></AdminContent></>;
}
