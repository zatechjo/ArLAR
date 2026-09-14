import { getManagedArlar27ExternalAsync } from "@/lib/arlar27-admin-repository";

/**
 * Internal ArLAR27 routes that are backed by an external portal (Cvent) rather
 * than by CMS content.
 */
const EXTERNAL_ROUTES = {
  abstracts: "/congresses/arlar27/abstracts",
  registration: "/congresses/arlar27/registration",
} as const;

/** Maps an internal ArLAR27 path to the external portal it should open. */
export type Arlar27ExternalLinks = Record<string, string>;

/**
 * Resolves which ArLAR27 routes currently point at an external portal.
 *
 * Links across the microsite consult this so they can open the portal in a new
 * tab instead of navigating away — visitors keep the congress site open behind
 * them. A destination only appears here once it is enabled and has a URL, so an
 * unconfigured section keeps its normal in-site page.
 */
export async function getArlar27ExternalLinksAsync(): Promise<Arlar27ExternalLinks> {
  const entries = await Promise.all(
    Object.entries(EXTERNAL_ROUTES).map(async ([kind, path]) => {
      const destination = await getManagedArlar27ExternalAsync(kind as keyof typeof EXTERNAL_ROUTES);
      return destination.enabled && destination.url ? ([path, destination.url] as const) : null;
    }),
  );

  return Object.fromEntries(entries.filter((entry) => entry !== null));
}
