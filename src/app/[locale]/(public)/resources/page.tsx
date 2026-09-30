import type { Metadata } from "next";
import {
  BookOpen, Code2, ShieldCheck, Building2, MessageCircle, ScrollText,
  Scale, UserCheck, FileSearch, Route, ArrowUpRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata: Metadata = meta(
  "Resources",
  "Documentation, product deep-dives, developer tools, and security references for Aegisora.",
);

type ResourceLink = { title: string; desc: string; href: string; icon: React.ComponentType<{ className?: string }> };

function ResourceGrid({ items }: { items: ResourceLink[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group aeg-panel flex flex-col p-5 transition-colors hover:border-primary/50"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-md bg-surface-3 p-2.5">
              <item.icon className="size-4 text-primary" />
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-foreground">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
        </Link>
      ))}
    </div>
  );
}

const DOCS_LINKS: ResourceLink[] = [
  { title: "Introduction", desc: "What Aegisora is and why an execution boundary matters.", href: "/docs", icon: BookOpen },
  { title: "Runtime Pipeline", desc: "The eight-stage model, from request to evidence.", href: "/docs#v3", icon: Route },
  { title: "Version History", desc: "How the product evolved from 1.0 to the current runtime.", href: "/docs#capability", icon: ScrollText },
  { title: "API Contract", desc: "The evaluate/decide request and response shape.", href: "/docs#api", icon: Code2 },
];

const PRODUCT_LINKS: ResourceLink[] = [
  { title: "Runtime", desc: "How context, policy, and risk are evaluated before execution.", href: "/product/runtime", icon: Route },
  { title: "Policies", desc: "Declarative, executable governance controls.", href: "/product/policies", icon: ScrollText },
  { title: "Decisions", desc: "Inspect every ALLOW, BLOCK, and ESCALATE outcome.", href: "/product/decisions", icon: Scale },
  { title: "Approvals", desc: "Human authorization at the execution boundary.", href: "/product/approvals", icon: UserCheck },
  { title: "Evidence", desc: "Durable, queryable records for every decision.", href: "/product/evidence", icon: FileSearch },
  { title: "Overview", desc: "The full execution-control model, end to end.", href: "/product", icon: ShieldCheck },
];

const BUILD_LINKS: ResourceLink[] = [
  { title: "Developers", desc: "Integration guides and SDKs for agent runtimes.", href: "/developers", icon: Code2 },
  { title: "Security", desc: "How Aegisora is built, deployed, and audited.", href: "/security", icon: ShieldCheck },
  { title: "Test Aegisora", desc: "Spin up a workspace and evaluate your first action.", href: "/signup", icon: ArrowUpRight },
];

const COMPANY_LINKS: ResourceLink[] = [
  { title: "Enterprise", desc: "Deployment models, SSO, and dedicated support.", href: "/enterprise", icon: Building2 },
  { title: "Pricing", desc: "Plans for teams evaluating and running in production.", href: "/pricing", icon: ScrollText },
  { title: "Changelog", desc: "What shipped in Aegisora 3.0 and what came before.", href: "/changelog", icon: Route },
  { title: "About", desc: "Why the execution boundary matters to us.", href: "/about", icon: BookOpen },
];

export default function ResourcesPage() {
  return (
    <div>
      <PageHero
        eyebrow="RESOURCES"
        title="Everything you need to run Aegisora."
        lead="Documentation, product references, developer tools, and security material — organized by what you're trying to do."
      />

      <Section eyebrow="DOCUMENTATION" title="Start here" lead="The core model: policy, risk, enforcement, and evidence.">
        <ResourceGrid items={DOCS_LINKS} />
      </Section>

      <Section tone="tinted" eyebrow="PRODUCT" title="Deep-dives by stage" lead="Each stage of the pipeline, explained on its own page.">
        <ResourceGrid items={PRODUCT_LINKS} />
      </Section>

      <Section eyebrow="BUILD" title="For developers" lead="Integrate Aegisora in front of the tool and API calls your agents already make.">
        <ResourceGrid items={BUILD_LINKS} />
      </Section>

      <Section tone="tinted" eyebrow="COMPANY" title="Company & plans" lead="Deployment options, pricing, and what's shipped so far.">
        <ResourceGrid items={COMPANY_LINKS} />
      </Section>

      <Section eyebrow="COMMUNITY" title="Talk to us">
        <div className="aeg-panel flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-surface-3 p-3">
              <MessageCircle className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Join the Aegisora Discord</h3>
              <p className="mt-1 text-sm text-muted-foreground">Questions, feedback, and early access to new releases.</p>
            </div>
          </div>
          
            <a
            href="https://discord.gg/8CM3PpQRT5"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3"
          >
            Open Discord &rarr;
          </a>
        </div>
      </Section>
    </div>
  );
}


