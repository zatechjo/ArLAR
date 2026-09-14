import documentManifest from "../../data/wix/documents-r2-manifest.json";

const documentsById = new Map(
  documentManifest.documents.map((document) => [
    document.id.toLowerCase(),
    document.publicUrl,
  ]),
);
const documentIdPattern =
  /[A-Za-z0-9]+_[A-Fa-f0-9]{20,}\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx|zip)/i;

export function migratedWixDocumentUrl(value: string | null | undefined) {
  const source = String(value || "").trim();
  const id = source.match(documentIdPattern)?.[0];
  return id ? documentsById.get(id.toLowerCase()) || source : source;
}
