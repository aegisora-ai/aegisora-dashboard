import Link from "next/link";
import { CtaBand, DataTable, PageHero, Section } from "@/components/aegisora/page-kit";
import { RuntimeSimulator } from "@/components/aegisora/runtime-simulator";
import { runtimeStages } from "@/lib/runtime-model";
import { btnOutline, btnPrimary } from "@/lib/ui";

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="AGENT EXECUTION CONTROL"
        title="Secure what your AI agents are allowed to do."
        lead="Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, risk and authorization before it reaches the real environment."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/signup" className={btnPrimary}>Test Aegisora</Link>
          <Link href="/enterprise" className={btnOutline}>Talk to Enterprise</Link>
        </div>
      </PageHero>

      <Section eyebrow="THE RUNTIME" title="One request, three possible outcomes.">
        <RuntimeSimulator />
      </Section>

      <Section tone="tinted" eyebrow="THE MODEL" title="Eight stages between intent and consequence.">
        <DataTable head={["Stage", "What happens", "Produces"]} rows={runtimeStages} mono={[0, 2]} />
      </Section>

      <CtaBand title="Decide before the action executes." />
    </>
  );
}