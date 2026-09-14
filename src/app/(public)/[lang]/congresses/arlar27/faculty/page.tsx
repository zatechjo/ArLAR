import { createStaticPageMetadata } from "@/lib/seo";

import { PeopleCardGrid } from "@/components/about/people-directory";
import { ComingSoonPanel } from "@/components/congresses/arlar27/coming-soon-panel";
import { Arlar27PageHero } from "@/components/congresses/arlar27/page-hero";
import { getManagedArlar27PeopleAsync } from "@/lib/arlar27-admin-repository";
import { getArlar27PeopleAsync } from "@/lib/arlar27-people";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27/faculty");

export default async function Arlar27FacultyPage() {
  const people = await getArlar27PeopleAsync(await getManagedArlar27PeopleAsync("faculty"), "arlar27-faculty");

  return (
    <main>
      <Arlar27PageHero title="Faculty" description="Regional and international experts will come together in Baghdad to share evidence, experience, and new perspectives." />
      {people.length ? (
        <section className="bg-[#f3f6f6] py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <PeopleCardGrid people={people} imageDirectory="" />
          </div>
        </section>
      ) : (
        <ComingSoonPanel
          label="Faculty announcements"
          title="The ArLAR27 faculty is taking shape."
          description="Confirmed faculty members will appear here as invitations are completed and the scientific programme is approved."
          items={["Confirmed faculty directory", "Speaker profiles and affiliations", "Sessions and faculty roles", "Faculty information and disclosures"]}
        />
      )}
    </main>
  );
}
