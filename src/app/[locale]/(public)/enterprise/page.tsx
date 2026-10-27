import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgEnterprise" });
  return { title: t("metaTitle") };
}

export default async function EnterprisePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgEnterprise" });
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
          { action: "payments.transfer $48,000", meta: "finance-agent" + dot + t("r1"), v: "ESCALATE" },
          { action: "crm.read_ticket", meta: "support-agent" + dot + t("r2"), v: "ALLOW" },
          { action: "db.drop_table users", meta: "code-agent" + dot + t("r3"), v: "BLOCK" },
        ]}
      />
      <Section eyebrow={t("secEyebrow")} title={t("secTitle")} tone="alt">
        <CardGrid
          cols={4}
          items={[
            { icon: "Layers", title: t("c1t"), body: t("c1b") },
            { icon: "Users", title: t("c2t"), body: t("c2b") },
            { icon: "ScrollText", title: t("c3t"), body: t("c3b") },
            { icon: "KeyRound", title: t("c4t"), body: t("c4b") },
          ]}
        />
      </Section>
      <CtaBand
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("ctaPrimary"), href: "/pilot" }}
        secondary={{ label: t("ctaSecondary"), href: "/pricing" }}
      />
    </>
  );
}