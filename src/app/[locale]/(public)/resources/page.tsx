import type { Metadata } from "next";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata: Metadata = meta(
  "Resources",
  "Documentation, product deep-dives, developer tools, and security references for Aegisora.",
);

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Everything you need to run Aegisora."
        intro="Documentation, product references, developer tools, and security material, organized by what you are trying to do."
        primary={{ label: "Read the docs", href: "/docs" }}
        secondary={{ label: "Test Aegisora", href: "/signup" }}
      />

      <Section eyebrow="Documentation" title="Start here" intro="The core model: policy, risk, enforcement, and evidence." tone="alt">
        <CardGrid
          cols={4}
          items={[
            { icon: "BookOpen", title: "Introduction", body: "What Aegisora is and why an execution boundary matters.", href: "/docs" },
            { icon: "Workflow", title: "Runtime Pipeline", body: "The eight-stage model, from request to evidence.", href: "/docs#v3" },
            { icon: "ScrollText", title: "Version History", body: "How the product evolved from 1.0 to the current runtime.", href: "/docs#capability" },
            { icon: "Terminal", title: "API Contract", body: "The evaluate/decide request and response shape.", href: "/docs#api" },
          ]}
        />
      </Section>

      <Section eyebrow="Product" title="Deep-dives by stage" intro="Each stage of the pipeline, explained on its own page.">
        <CardGrid
          items={[
            { icon: "Workflow", title: "Runtime", body: "How context, policy, and risk are evaluated before execution.", href: "/product/runtime" },
            { icon: "ScrollText", title: "Policies", body: "Declarative, executable governance controls.", href: "/product/policies" },
            { icon: "Scale", title: "Decisions", body: "Inspect every ALLOW, BLOCK, and ESCALATE outcome.", href: "/product/decisions" },
            { icon: "UserCheck", title: "Approvals", body: "Human authorization at the execution boundary.", href: "/product/approvals" },
            { icon: "Fingerprint", title: "Evidence", body: "Durable, queryable records for every decision.", href: "/product/evidence" },
            { icon: "ShieldCheck", title: "Overview", body: "The full execution-control model, end to end.", href: "/product" },
          ]}
        />
      </Section>

      <Section eyebrow="Build" title="For developers" intro="Integrate Aegisora in front of the tool and API calls your agents already make." tone="alt">
        <CardGrid
          items={[
            { icon: "Terminal", title: "Developers", body: "Integration guides and SDKs for agent runtimes.", href: "/developers" },
            { icon: "Lock", title: "Security", body: "How Aegisora is built, deployed, and audited.", href: "/security" },
            { icon: "Zap", title: "Test Aegisora", body: "Spin up a workspace and evaluate your first action.", href: "/signup" },
          ]}
        />
      </Section>

      <Section eyebrow="Company" title="Company and plans" intro="Deployment options, pricing, and what has shipped so far.">
        <CardGrid
          cols={4}
          items={[
            { icon: "Users", title: "Enterprise", body: "Scoped design-partner pilots and security review.", href: "/enterprise" },
            { icon: "Gauge", title: "Pricing", body: "Plans for teams evaluating and running in production.", href: "/pricing" },
            { icon: "GitBranch", title: "Changelog", body: "What shipped in Aegisora 4.0 and what came before.", href: "/changelog" },
            { icon: "BookOpen", title: "About", body: "Why the execution boundary matters to us.", href: "/about" },
          ]}
        />
      </Section>

      <Section eyebrow="Community" title="Talk to us" tone="alt">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-medium">Join the Aegisora Discord</h3>
            <p className="mt-1 text-sm text-white/70">Questions, feedback, and early access to new releases.</p>
          </div>
          <a
            href="https://discord.gg/8CM3PpQRT5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center whitespace-nowrap rounded-md bg-white px-6 text-sm font-semibold text-[#0a2a7a] transition hover:bg-white/90"
          >
            Open Discord
          </a>
        </div>
      </Section>

      <CtaBand
        title="Ready to see a decision?"
        body="Create a test workspace, send one request and read the verdict."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
      />
    </>
  );
}