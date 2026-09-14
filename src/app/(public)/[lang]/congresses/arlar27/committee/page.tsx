import { createStaticPageMetadata } from "@/lib/seo";

import { PeopleCardGrid } from "@/components/about/people-directory";
import { Arlar27PageHero } from "@/components/congresses/arlar27/page-hero";
import { getManagedArlar27PeopleAsync } from "@/lib/arlar27-admin-repository";
import { getArlar27PeopleAsync } from "@/lib/arlar27-people";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27/committee");

export default async function Arlar27CommitteePage() {
  const people = await getArlar27PeopleAsync(await getManagedArlar27PeopleAsync("committee"), "arlar27-committee");

  return (
    <main>
      <Arlar27PageHero title="Congress Committee" description="The leaders and working groups guiding the scientific vision and congress experience of ArLAR27." />
      <section className="bg-[#f3f6f6] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PeopleCardGrid people={people} imageDirectory="" />
        </div>
      </section>
    </main>
  );
}
