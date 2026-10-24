import type { Metadata } from "next";

const OG_IMAGE = {
  url: "/api/og",
  width: 1200,
  height: 630,
  alt: "Aegisora - governance for AI agents",
};

export function meta(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "Aegisora", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}