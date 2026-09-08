import type { MetadataRoute } from "next";
import { seo } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${seo.url}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${seo.url}/insights/a-bullet-that-thinks`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
  ];
}
