import { Save } from "lucide-react";

import { createProfessionalResourceAction } from "@/app/(admin)/admin/(panel)/professionals/actions";
import { ProfessionalResourceEditor } from "@/components/admin/professional-resource-editor";
import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import type { ProfessionalResource } from "@/lib/professional-resources-repository";

const emptyResource: ProfessionalResource = { id: "new", kind: "document", title: "", description: "", collection: "", publicHref: "", date: "", journal: "", authors: [], topics: [], image: "", resourceUrl: "", actionLabel: "Open resource", language: "English", issueNumber: "", status: "draft" };

export default async function NewProfessionalResourcePage() {
  return <><AdminPageHeader title="Add professional resource" description="Create a publication, bulletin, document, or partner resource." actions={<button type="submit" form="professional-resource-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:bg-crimson-700"><Save size={15} />Create resource</button>} /><AdminContent className="max-w-[1400px]"><ProfessionalResourceEditor resource={emptyResource} media={await getAdminMediaLibraryAsync()} action={createProfessionalResourceAction} /></AdminContent></>;
}
