import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://aegisora.org";

const PATHS = [
  "",
  "/about",
  "/blog",
  "/changelog",
  "/contact",
  "/docs",
  "/pricing",
  "/proof",
  "/resources",
  "/terms",
  "/trust",
  "/trust/privacy",
  "/trust/subprocessors",
  "/developers",
  "/developers/quickstart",
  "/enterprise",
  "/evidence",
  "/product",
  "/product/approvals",
  "/product/decisions",
  "/product/evidence",
  "/product/policies",
  "/product/runtime",
  "/security",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({
    url: BASE + p,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}