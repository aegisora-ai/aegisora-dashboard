import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CtaBand, PageHero, Section, CardGrid } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return meta(t("metaTitle"), t("metaDesc"));
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
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

      <Section eyebrow={t("shiftEyebrow")} title={t("shiftTitle")} tone="alt">
        <CardGrid
          cols={3}
          items={[
            { icon: "Terminal", title: t("c1t"), body: t("c1b") },
            { icon: "Layers", title: t("c2t"), body: t("c2b") },
            { icon: "Scale", title: t("c3t"), body: t("c3b") },
            { icon: "Webhook", title: t("c4t"), body: t("c4b") },
            { icon: "ShieldCheck", title: t("c5t"), body: t("c5b") },
          ]}
        />
      </Section>

      <Section eyebrow={t("posEyebrow")} title={t("posTitle")}>
        <div className="max-w-2xl space-y-4 text-foreground/75">
          <p className="text-base leading-relaxed sm:text-lg">{t("posP1")}</p>
          <p className="font-mono text-sm tracking-wide text-primary">{t("posP2")}</p>
        </div>
      </Section>

      <CtaBand
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("primary"), href: "/signup" }}
        secondary={{ label: t("secondary"), href: "/enterprise" }}
      />
    </>
  );
}