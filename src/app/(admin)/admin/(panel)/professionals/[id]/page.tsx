import { ExternalLink, Save } from "lucide-react";
import { notFound } from "next/navigation";

import { saveProfessionalResourceAction } from "@/app/(admin)/admin/(panel)/professionals/actions";
import { ProfessionalResourceDeleteButton } from "@/components/admin/professional-resource-delete-button";
import { ProfessionalResourceEditor } from "@/components/admin/professional-resource-editor";
import { AdminContent, AdminLink, AdminPageHeader } from "@/components/admin/admin-ui";
import { isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { getProfessionalResourceAsync } from "@/lib/professional-resources-repository";

export default async function ProfessionalResourcePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [resource, deleted] = await Promise.all([getProfessionalResourceAsync(id, "admin"), isAdminRecordDeletedAsync("professional-resources", id)]);
  if (!resource || deleted) notFound();
  const action = saveProfessionalResourceAction.bind(null, id);
  return <><AdminPageHeader title={resource.title} description="Manage the resource, attached media, and public visibility." actions={<><ProfessionalResourceDeleteButton id={resource.id} title={resource.title} />{resource.publicHref ? <AdminLink href={resource.publicHref} variant="secondary"><ExternalLink size={15} />Public page</AdminLink> : null}<button type="submit" form="professional-resource-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:bg-crimson-700"><Save size={15} />Save changes</button></>} /><AdminContent className="max-w-[1400px]">{query.saved === "1" || query.created === "1" ? <div className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Resource saved.</div> : null}<ProfessionalResourceEditor resource={resource} media={await getAdminMediaLibraryAsync()} action={action} /></AdminContent></>;
}
