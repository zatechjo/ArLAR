import type { MetadataRoute } from "next";

const baseUrl = "https://www.arabrheumatology.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
