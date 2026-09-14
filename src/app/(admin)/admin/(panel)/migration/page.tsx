import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { LocalDataImporter } from "@/components/admin/local-data-importer";
import { R2DocumentMigrator } from "@/components/admin/r2-document-migrator";
import { R2ImageMigrator } from "@/components/admin/r2-image-migrator";
import { requireAdminOwner } from "@/lib/admin-authorization";
import { migrateLocalDocumentsToR2, migrateLocalImagesToR2, runLocalDataImport } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMigrationPage() {
  await requireAdminOwner();
  return <><AdminPageHeader eyebrow="Supabase operations" title="Database migration" description="Move the existing local admin records into the Supabase content tables." /><AdminContent><LocalDataImporter action={runLocalDataImport} /><R2DocumentMigrator action={migrateLocalDocumentsToR2} /><R2ImageMigrator action={migrateLocalImagesToR2} /></AdminContent></>;
}
