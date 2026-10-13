import type { MetadataRoute } from "next";
import { getPublicPortfolio } from "@/lib/public-data";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const projects = await getPublicPortfolio();
    const projectUrls = projects
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${siteUrl}/projects/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));
    return [...base, ...projectUrls];
  } catch {
    return base;
  }
}
