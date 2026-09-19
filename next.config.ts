import type { NextConfig } from "next";

const r2PublicHostname = (() => {
  const value = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim();
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
})();

const r2PublicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");

/**
 * Keep locale routing in Vercel's routing layer instead of Proxy. Proxy is a
 * server invocation and would otherwise consume Fluid CPU on every public hit.
 */
const LOCALE_REWRITE_EXCLUSIONS =
  "(?!en$|en/|ar$|ar/|fr$|fr/|admin$|admin/|api$|api/|_next/|images/|documents/|flags/)(?!.*\\.)";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    viewTransition: true,
    // Doctor and CMS edits must be visible immediately while developing.
    // Next otherwise retains Server Component fetches across HMR updates,
    // which makes Supabase-backed pages appear out of sync and grows RAM.
    serverComponentsHmrCache: false,
    serverActions: {
      // Media uploads go directly from the browser to R2 via signed URLs. The
      // action only receives metadata, so accepting 100 MB request bodies would
      // waste memory and CPU and enlarge the abuse surface.
      bodySizeLimit: "2mb",
    },
  },
  images: {
    // Avoid consuming Vercel Image Optimization transformations. Source media
    // is served from the R2-backed paths below.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      ...(r2PublicHostname ? [{ protocol: "https" as const, hostname: r2PublicHostname, pathname: "/**" }] : []),
    ],
  },
  async redirects() {
    return [
      { source: "/favicon.png", destination: "/favicon.ico", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async rewrites() {
    const mediaRewrites = r2PublicBaseUrl
      ? [
          { source: "/images/:path*", destination: `${r2PublicBaseUrl}/images/:path*` },
          { source: "/documents/:path*", destination: `${r2PublicBaseUrl}/documents/:path*` },
          // Keep spaces out of the public route. A literal `/Arab Flags/...`
          // source does not match reliably once Vercel normalizes the URL.
          { source: "/flags/:path*", destination: `${r2PublicBaseUrl}/Arab%20Flags/:path*` },
        ]
      : [];

    return {
      beforeFiles: [
        { source: "/", destination: "/en" },
        {
          source: `/:path(${LOCALE_REWRITE_EXCLUSIONS}.+)`,
          destination: "/en/:path",
        },
      ],
      afterFiles: mediaRewrites,
      fallback: [],
    };
  },
};

export default nextConfig;
