import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgProof" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

const EXAMPLE = [
  "{",
  '  "effect": "BLOCK",',
  '  "reason": "Policy: no external transfer of customer PII",',
  '  "policy_id": "<uuid>",',
  '  "evidence_hash": "<hash>"',
  "}",
].join("\n");

export default async function ProofPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgProof" });
  const dot = " \u00b7 ";
  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
        primary={{ label: t("primary"), href: "/signup" }}
        secondary={{ label: t("secondary"), href: "/docs" }}
        rows={[
          { action: "crm.read_ticket", meta: "support-agent" + dot + t("r1"), v: "ALLOW" },
          { action: "payments.transfer $48,000", meta: "finance-agent" + dot + t("r2"), v: "ESCALATE" },
          { action: "db.drop_table users", meta: "code-agent" + dot + t("r3"), v: "BLOCK" },
        ]}
      />
      <Section eyebrow={t("howEyebrow")} title={t("howTitle")} tone="alt">
        <CardGrid
          cols={4}
          items={[
            { n: "01", title: t("s1t"), body: t("s1b") },
            { n: "02", title: t("s2t"), body: t("s2b") },
            { n: "03", title: t("s3t"), body: t("s3b") },
            { n: "04", title: t("s4t"), body: t("s4b") },
          ]}
        />
      </Section>
      <Section eyebrow={t("respEyebrow")} title={t("respTitle")} intro={t("respIntro")}>
        <pre className="overflow-x-auto rounded-xl border border-border bg-surface-1 p-5 font-mono text-sm text-foreground">
          <code>{EXAMPLE}</code>
        </pre>
      </Section>
      <CtaBand
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("ctaPrimary"), href: "/signup" }}
        secondary={{ label: t("ctaSecondary"), href: "/pilot" }}
      />
    </>
  );
}