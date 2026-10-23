import { CtaBand, PageHero, Section, CardGrid } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Company",
  "Autonomous AI systems are moving from generating information to taking real actions. Aegisora focuses on the execution boundary.",
);

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Execution should be governed."
        intro="Autonomous AI systems are moving from generating information to taking real actions. Aegisora exists because that shift makes the execution boundary a critical control surface."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
        rows={[
          { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
          { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", v: "ESCALATE" },
          { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK" },
        ]}
      />

      <Section eyebrow="The shift" title="As agents gain the ability to act." tone="alt">
        <CardGrid
          cols={3}
          items={[
            { icon: "Terminal", title: "Call tools", body: "Agents invoke tools and APIs on their own." },
            { icon: "Layers", title: "Modify systems", body: "Agents change records, files and configuration." },
            { icon: "Scale", title: "Execute transactions", body: "Agents move money and trigger business processes." },
            { icon: "Webhook", title: "Interact with external services", body: "Agents reach beyond the systems you control." },
            { icon: "ShieldCheck", title: "Operate in production environments", body: "Agents run where mistakes have real cost." },
          ]}
        />
      </Section>

      <Section eyebrow="Our position" title="Reasoning is not authority.">
        <div className="max-w-2xl space-y-4 text-white/75">
          <p className="text-base leading-relaxed sm:text-lg">
            AI agents should not receive unrestricted execution authority simply because they can reason or generate an action.
          </p>
          <p className="font-mono text-sm tracking-wide text-sky-300">
            Execution should be governed. Execution should be enforceable. Execution should be auditable.
          </p>
        </div>
      </Section>

      <CtaBand
        title="Secure what your AI agents are allowed to do."
        body="Create a test workspace, send one request and read the decision."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
      />
    </>
  );
}