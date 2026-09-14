import "server-only";

import translationExport from "../../data/wix/blog/bilingual/translations.json";

export type ImportedNewsTranslation = {
  title: string;
  body: string;
  richContent?: unknown;
  excerpt?: string;
  sourcePostId?: string;
  sourceSiteId?: string;
  sourceSlug?: string;
  firstPublishedDate?: string | null;
  lastPublishedDate?: string | null;
  matchType?: string;
  matchDeltaMs?: number;
};

type TranslationExport = {
  translations: Array<{ id: string; slug: string; arabic: ImportedNewsTranslation }>;
};

const translations = (translationExport as TranslationExport).translations;
const byId = new Map(translations.map((record) => [record.id, record.arabic]));
const bySlug = new Map(translations.map((record) => [record.slug, record.arabic]));

export function getImportedArabicTranslation(id: string, slug?: string) {
  return byId.get(id) ?? (slug ? bySlug.get(slug) : undefined);
}
