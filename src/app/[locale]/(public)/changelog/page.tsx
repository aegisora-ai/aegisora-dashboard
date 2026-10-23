import type { Metadata } from "next";
import { ChangelogTimeline } from "@/components/aegisora/changelog-timeline";
import { PageHero } from "@/components/aegisora/page-kit";

export const metadata: Metadata = {
  title: "Changelog | Aegisora",
  description: "Every Aegisora release from v0.1.0 Foundation to v4.0.0 Continuity Seal.",
};

export default function ChangelogPage() {
  return (
    <>
      <PageHero
        eyebrow="Changelog"
        title="Every release, from foundation to enterprise runtime."
        intro="Aegisora enforces governance before execution. Each release builds on the last: evidence, canonical authority, governance boundary, runtime hardening, platform, enterprise runtime and execution continuity."
        phrases={["Foundation.", "Evidence.", "Canonical authority.", "Governance platform.", "Execution continuity."]}
      />
      <ChangelogTimeline />
    </>
  );
}