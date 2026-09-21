import { CtaBand, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Company",
  "Autonomous AI systems are moving from generating information to taking real actions. Aegisora focuses on the execution boundary.",
);

const abilities = [
  "Call tools",
  "Modify systems",
  "Execute transactions",
  "Interact with external services",
  "Operate in production environments",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="COMPANY"
        title="Execution should be governed."
        lead="Autonomous AI systems are moving from generating information to taking real actions. Aegisora exists because that shift makes the execution boundary a critical control surface."
      />

      <Section eyebrow="THE SHIFT" title="As agents gain the ability to act.">
        <ul className="aeg-panel grid gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-5">
          {abilities.map((a) => (
            <li key={a} className="bg-surface-2 px-5 py-5 text-sm">{a}</li>
          ))}
        </ul>
      </Section>

      <Section tone="tinted" eyebrow="OUR POSITION" title="Reasoning is not authority.">
        <div className="max-w-2xl space-y-4 text-muted-foreground">
          <p>
            AI agents should not receive unrestricted execution authority simply because they can reason
            or generate an action.
          </p>
          <p className="font-mono text-sm tracking-wide text-foreground">
            Execution should be governed. Execution should be enforceable. Execution should be auditable.
          </p>
        </div>
      </Section>

      <CtaBand title="Secure what your AI agents are allowed to do." />
    </>
  );
}