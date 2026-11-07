import type { Metadata } from "next";
import { TechDocs } from "@/components/aegisora/tech-docs/tech-docs";

export const metadata: Metadata = {
  title: "Technical documentation",
  description:
    "Aegisora runtime reference: governance pipeline, canonical authority, Continuity Seal, evidence and enterprise controls for autonomous AI agents.",
};

export default function TechnicalDocsPage() {
  return <TechDocs />;
}