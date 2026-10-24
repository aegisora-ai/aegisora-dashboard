import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://aegisora.org";

const PATHS = [
  "",
  "/about",
  "/blog",
  "/docs",
  "/docs/technical",
  "/enterprise",
  "/impressum",
  "/pilot",
  "/pricing",
  "/product",
  "/proof",
  "/security",
  "/solutions",
  "/terms",
  "/trust",
  "/trust/privacy",
  "/trust/subprocessors",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({
    url: BASE + p,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}