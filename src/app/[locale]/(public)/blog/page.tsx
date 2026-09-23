import { PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Blog",
  "Notes on runtime security and execution control for autonomous AI agents.",
);

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="BLOG"
        title="Notes on the execution boundary."
        lead="Writing on runtime security, policy design and agent governance."
      />
      <Section>
        <p className="text-sm text-muted-foreground">No posts have been published yet.</p>
      </Section>
    </>
  );
}