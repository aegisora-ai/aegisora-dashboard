import type { Metadata } from "next";
import { ChangelogTimeline } from "@/components/aegisora/changelog-timeline";

export const metadata: Metadata = {
  title: "Changelog | Aegisora",
  description: "Every Aegisora release from v0.1.0 Foundation to v3.0.0 Enterprise Governance Runtime.",
};

export default function ChangelogPage() {
  return <ChangelogTimeline />;
}