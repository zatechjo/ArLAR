import { createStaticPageMetadata } from "@/lib/seo";

import { EducationalLibrary } from "@/components/education/educational-library";
import { PageHero } from "@/components/page-hero";
import {
  libraryCollections,
} from "@/lib/educational-library";
import { getManagedEducationalLibrary } from "@/lib/managed-educational-library";

export const generateMetadata = createStaticPageMetadata("/education");

export default async function EducationPage() {
  const resources = await getManagedEducationalLibrary();
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Educational Library" }]}
        title="Educational Library"
        description="One place to search, watch, read, and revisit ArLAR's growing collection of rheumatology education."
        grainId="education-library-hero-grain"
      />

      <EducationalLibrary
        resources={resources}
        collections={libraryCollections}
      />
    </main>
  );
}
