import { createStaticPageMetadata } from "@/lib/seo";

import { AboutDirectoryHero } from "@/components/about/about-directory-hero";
import { publicMediaUrl } from "@/lib/media-url";

export const generateMetadata = createStaticPageMetadata("/about/bylaws");

export default function BylawsPage() {
  return (
    <main>
      <AboutDirectoryHero
        currentPage="ArLAR Bylaws"
        title="ArLAR Bylaws"
        description="Browse the official governing document of the Arab League of Associations for Rheumatology."
        grainId="bylaws-hero-grain"
      />

      <section className="bg-white pt-5 sm:pt-6">
        <div className="mx-auto max-w-7xl">
          <iframe
            title="ArLAR Bylaws PDF"
            src={`${publicMediaUrl("/documents/arlar-bylaws-2023.pdf")}#zoom=100`}
            className="block min-h-[64rem] w-full border-0 bg-white"
            style={{ height: "max(64rem, calc(100vh - 2rem))" }}
          />
        </div>
        <div aria-hidden className="h-10 sm:h-12" />
      </section>
    </main>
  );
}
