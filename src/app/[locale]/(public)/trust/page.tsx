import { getTranslations } from "next-intl/server";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgTrust" });
  return meta(t("eyebrow"), t("metaDesc"));
}

export default async function TrustPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgTrust" });
  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
        primary={{ label: t("primary"), href: "/pilot" }}
        secondary={{ label: t("secondary"), href: "/security" }}
      />
      <Section title={t("secTitle")} tone="alt">
        <CardGrid
          cols={2}
          items={[
            { icon: "Eye", title: t("c1t"), body: t("c1b"), href: "/trust/privacy" },
            { icon: "Users", title: t("c2t"), body: t("c2b"), href: "/trust/subprocessors" },
            { icon: "FileText", title: t("c3t"), body: t("c3b"), href: "/terms" },
            { icon: "ShieldCheck", title: t("c4t"), body: t("c4b"), href: "/security" },
          ]}
        />
      </Section>
      <CtaBand
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("ctaPrimary"), href: "/pilot" }}
        secondary={{ label: t("ctaSecondary"), href: "/proof" }}
      />
    </>
  );
}