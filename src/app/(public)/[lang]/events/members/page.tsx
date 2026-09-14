import { createStaticPageMetadata } from "@/lib/seo";

import { MemberEventsDirectory } from "@/components/events/member-events-directory";
import { PageHero } from "@/components/page-hero";
import { getMemberEventPosts } from "@/data/member-news";
import type { Locale } from "@/i18n/config";

export const generateMetadata = createStaticPageMetadata("/events/members");

export default async function MemberEventsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const memberEventPosts = await getMemberEventPosts(lang);
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "Events & Congresses" },
          { label: "Members Events" },
        ]}
        title="ArLAR Members Events & Congresses"
        description="The latest congresses, announcements, and society news from ArLAR member countries."
        grainId="member-events-hero-grain"
      />

      <MemberEventsDirectory posts={memberEventPosts} />
    </main>
  );
}
