import type { MetadataRoute } from "next";
import { categories, collections, professions, useCases } from "@/lib/data";
import { plutosLibrary } from "@/lib/plutos-library";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mypluto.vercel.app";

const staticRoutes = [
  "",
  "/plutos-library",
  "/categories",
  "/pluto-guides",
  "/trending",
  "/compare",
  "/play",
  "/pluto",
  "/use-cases",
  "/privacy",
  "/verification",
  "/terms",
  "/disclaimer",
  "/editorial-methodology",
  "/ranking-methodology",
  "/disclosures",
  "/corrections"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ...staticRoutes,
    ...categories.map((category) => `/categories/${category.slug}`),
    ...collections.map((collection) => `/collections/${collection.slug}`),
    ...professions.map((profession) => `/for/${profession.slug}`),
    ...useCases.map((useCase) => `/use-cases/${useCase.slug}`),
    ...plutosLibrary.tools.map((tool) => `/tools/${tool.slug}`)
  ];

  return [...new Set(routes)].map((route): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: route.startsWith("/tools/") ? "monthly" : "weekly",
      priority: route === "" ? 1 : route.startsWith("/tools/") ? 0.7 : 0.8
    }));
}
