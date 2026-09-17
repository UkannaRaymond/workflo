import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The app itself is behind auth and has nothing for a crawler to
        // index — keep search engines out of it explicitly, in addition
        // to the noindex meta tag on the workspace layout.
        disallow: ["/workspace", "/api", "/rpc"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
