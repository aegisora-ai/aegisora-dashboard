import { getTranslations } from "next-intl/server";
import { PageHero, Section, DataTable } from "@/components/aegisora/page-kit";
import { DraftNotice } from "@/components/aegisora/draft-notice";
import { meta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgSub" });
  return meta(t("metaTitle"), t("metaDesc"));
}

export default async function SubprocessorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgSub" });
  const tbc = t("tbc");
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <Section>
        <DraftNotice>{t("draft")}</DraftNotice>
        <DataTable
          head={[t("h1"), t("h2"), t("h3"), t("h4"), t("h5")]}
          rows={[
            ["Supabase", t("sb1"), t("sb2"), t("sb3"), tbc],
            ["Vercel", t("vc1"), t("vc2"), t("vc3"), tbc],
            ["Sentry", t("se1"), t("se2"), t("se3"), tbc],
            ["Stripe", t("st1"), t("st2"), tbc, tbc],
          ]}
        />
      </Section>
    </>
  );
}