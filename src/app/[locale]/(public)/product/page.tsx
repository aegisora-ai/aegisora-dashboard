import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Product" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function ProductIndex({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Product");
  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
        primary={{ label: t("primary"), href: "/signup" }}
        secondary={{ label: t("secondary"), href: "/enterprise" }}
        rows={[
          { action: "crm.read_ticket", meta: t("row1"), v: "ALLOW" },
          { action: "payments.transfer $48,000", meta: t("row2"), v: "ESCALATE" },
          { action: "db.drop_table users", meta: t("row3"), v: "BLOCK" },
        ]}
      />
      <Section eyebrow={t("partsEyebrow")} title={t("partsTitle")} tone="alt">
        <CardGrid
          cols={3}
          items={[
            { icon: "Workflow", title: t("runtimeTitle"), body: t("runtimeBody"), href: "/docs/technical#pipeline" },
            { icon: "ShieldCheck", title: t("policiesTitle"), body: t("policiesBody"), href: "/docs/technical#authority" },
            { icon: "Gauge", title: t("decisionsTitle"), body: t("decisionsBody"), href: "/docs/technical#decisions" },
            { icon: "UserCheck", title: t("approvalsTitle"), body: t("approvalsBody"), href: "/docs/technical#approvals" },
            { icon: "ScrollText", title: t("evidenceTitle"), body: t("evidenceBody"), href: "/docs/technical#evidence" },
          ]}
        />
      </Section>
      <CtaBand
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("ctaPrimary"), href: "/signup" }}
        secondary={{ label: t("ctaSecondary"), href: "/docs" }}
      />
    </>
  );
}