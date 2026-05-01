import { MetadataRoute } from "next";
import { turso } from "@/lib/db";

const BASE_URL = process.env.SITE_URL || "https://airportmatrix.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE_URL}/airports`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const airportsResult = await turso.execute("SELECT code, updated_at FROM airports ORDER BY code ASC");
    for (const row of airportsResult.rows) {
      const code = String(row.code).toLowerCase();
      dynamicRoutes.push({
        url: `${BASE_URL}/airport/${code}`,
        lastModified: row.updated_at ? new Date(String(row.updated_at)) : new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    const parkingResult = await turso.execute(
      "SELECT p.slug, p.updated_at, a.code FROM parking_providers p JOIN airports a ON p.airport_id = a.id ORDER BY p.updated_at DESC"
    );
    for (const row of parkingResult.rows) {
      const code = String(row.code).toLowerCase();
      const slug = String(row.slug);
      dynamicRoutes.push({
        url: `${BASE_URL}/airport/${code}/${slug}`,
        lastModified: row.updated_at ? new Date(String(row.updated_at)) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Sitemap: failed to fetch dynamic routes:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
