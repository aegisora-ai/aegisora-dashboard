import type { Metadata } from "next";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";
import { POSTS, formatDate } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on securing autonomous AI agents at runtime.",
};

export default function BlogIndex() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes on securing AI agents at runtime."
        intro="How to put a decision point in front of autonomous agents, what to record, and where humans belong in the loop."
      />
      <Section title="Latest posts" tone="alt">
        <CardGrid
          cols={3}
          items={POSTS.map((p) => ({
            n: p.category + " · " + formatDate(p.date),
            title: p.title,
            body: p.excerpt + " (" + p.readMinutes + " min read)",
            href: "/blog/" + p.slug,
          }))}
        />
      </Section>
      <CtaBand
        title="Try it in a test workspace."
        body="Send one request and read the decision."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Read the quickstart", href: "/developers/quickstart" }}
      />
    </>
  );
}