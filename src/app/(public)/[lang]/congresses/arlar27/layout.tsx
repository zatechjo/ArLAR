import { Arlar27MicrositeNav } from "@/components/congresses/arlar27/microsite-nav";
import { arlar27, arlar27Navigation } from "@/data/arlar27";
import { getArlar27ExternalLinksAsync } from "@/lib/arlar27-external-links";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export default async function Arlar27Layout({ children }: { children: React.ReactNode }) {
  const [congress, navigation, externalLinks] = await Promise.all([
    getPublishedSiteContent("arlar27", "overview", arlar27),
    getPublishedSiteContent("arlar27", "navigation", arlar27Navigation),
    getArlar27ExternalLinksAsync(),
  ]);
  return (
    <div className="bg-white">
      <Arlar27MicrositeNav congress={congress} navigation={navigation} externalLinks={externalLinks} />
      {children}
    </div>
  );
}
