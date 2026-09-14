import { createStaticPageMetadata } from "@/lib/seo";

import { ComingSoonPanel } from "@/components/congresses/arlar27/coming-soon-panel";
import { Arlar27PageHero } from "@/components/congresses/arlar27/page-hero";
import { Arlar27PortalCta } from "@/components/congresses/arlar27/portal-cta";
import { getManagedArlar27ExternalAsync } from "@/lib/arlar27-admin-repository";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27/registration");

export default async function Arlar27RegistrationPage() {
  const destination: { url: string; enabled: boolean } = await getManagedArlar27ExternalAsync("registration");
  // See the abstracts page: the portal opens in a new tab rather than replacing
  // the congress site, including for visitors who land on this route directly.
  const portalUrl = destination.enabled && destination.url ? destination.url : null;

  return (
    <main>
      <Arlar27PageHero title="Registration" description="Plan to join the Arab rheumatology community in Baghdad from 24 to 27 March 2027." />
      {portalUrl ? (
        <Arlar27PortalCta
          title="Registration is open."
          description="Registration is handled on the official congress portal, which opens in a new tab."
          action="Open the registration portal"
          url={portalUrl}
        />
      ) : (
        <ComingSoonPanel
          label="Registration"
          title="Registration will open here."
          description="The official registration portal is not yet open. Confirmed rates and attendance information will be published before registration begins."
          items={["Registration opening date", "Attendance categories and fees", "Payment and confirmation information", "Invitation-letter guidance"]}
        />
      )}
    </main>
  );
}
