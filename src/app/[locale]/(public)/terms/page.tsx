import { PageHero, Section } from "@/components/aegisora/page-kit";
import { DraftNotice } from "@/components/aegisora/draft-notice";
import { meta } from "@/lib/seo";

export const metadata = meta("Terms", "How Aegisora pilots are governed. Draft, pending legal review.");

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="TERMS" title="Terms." lead="How design-partner pilots are governed while the full terms are finalized." />
      <Section>
        <DraftNotice>Draft. The full Terms of Service are being finalized and have not been reviewed by legal counsel. Until they are published, a pilot is governed by the signed order form.</DraftNotice>
        <div className="max-w-2xl space-y-8 text-sm leading-6 text-muted-foreground">
          <div>
            <h2 className="text-base font-medium text-foreground">Pilots</h2>
            <p className="mt-3">A pilot starts only after both parties sign a quote that states scope, term, fee, invoice schedule, and data boundaries. Pilots use a non-production workspace with synthetic or customer-approved low-risk data.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Execution control stays with you</h2>
            <p className="mt-3">You keep the final tool-execution decision. A tool must not run unless your integration receives an ALLOW result. ESCALATE is not an approval and must pause the action for your human reviewer.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">What is not promised</h2>
            <p className="mt-3">No SLA, uptime, latency, accuracy, ROI, or compliance guarantees are given during a pilot.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Contact</h2>
            <p className="mt-3">Questions about terms: <a href="mailto:sales@aegisora.org" className="underline underline-offset-4">sales@aegisora.org</a>.</p>
          </div>
        </div>
      </Section>
    </>
  );
}