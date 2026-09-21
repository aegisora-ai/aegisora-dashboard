import Link from "next/link";
import { CtaBand, DataTable, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Evidence",
  "Aegisora links each decision to enforcement, execution, evidence and audit records with structured identifiers.",
);

const chain = [
  ["Decision", "dec_01J8XQ4M2K"],
  ["Enforcement", "Gate paused"],
  ["Execution", "exe_5b10d8e4"],
  ["Evidence", "evd_a24c07f1"],
  ["Audit", "aud_3e9b62d0"],
];

const questions = [
  "Who acted",
  "What was done",
  "Through which agent",
  "In which workspace",
  "Under which policy",
  "With what decision",
  "Under what risk context",
  "With what enforcement result",
  "What evidence was produced",
];

export default function EvidencePage() {
  return (
    <>
      <PageHero
        eyebrow="PRODUCT / EVIDENCE"
        title="Evidence is a connected record, not a metric."
        lead="Each important decision is linked to enforcement, execution, evidence and audit records, so the story of an action can be reconstructed later."
      />

      <Section eyebrow="THE CHAIN" title="Decision to audit, linked by identifier.">
        <ol className="aeg-panel grid gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-5">
          {chain.map(([label, value]) => (
            <li key={label} className="bg-surface-2 p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-2 break-all font-mono text-xs">{value}</div>
            </li>
          ))}
        </ol>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">Sample identifiers.</p>
      </Section>

      <Section tone="tinted" eyebrow="IDENTIFIERS" title="What a record can be tied to.">
        <DataTable
          head={["Identifier", "Ties the record to"]}
          rows={[
            ["decision ID", "The decision that governed the action."],
            ["trace ID", "The end-to-end execution trace."],
            ["execution ID", "The execution, or the attempt that was stopped."],
            ["evidence ID", "The evidence record itself."],
            ["audit ID", "The enterprise audit entry."],
            ["agent ID", "The agent that proposed the action."],
            ["workspace", "The workspace context the action ran in."],
          ]}
          mono={[0]}
        />
      </Section>

      <Section eyebrow="AUDIT" title="The questions an audit trail should answer.">
        <ul className="aeg-panel grid gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((q) => (
            <li key={q} className="bg-surface-2 px-5 py-3.5 text-sm">{q}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/dashboard/evidence" className="text-cyan underline-offset-4 hover:underline">
            Browse the sample evidence ledger
          </Link>
        </p>
      </Section>

      <CtaBand title="Evidence for every important decision." />
    </>
  );
}