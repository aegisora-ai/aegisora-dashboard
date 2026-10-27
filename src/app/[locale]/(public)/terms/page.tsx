import { getTranslations } from "next-intl/server";
import { PageHero, Section } from "@/components/aegisora/page-kit";
import { DraftNotice } from "@/components/aegisora/draft-notice";
import { meta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgTerms" });
  return meta(t("metaTitle"), t("metaDesc"));
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgTerms" });
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <Section>
        <DraftNotice>{t("draft")}</DraftNotice>
        <div className="max-w-2xl space-y-8 text-sm leading-6 text-muted-foreground">
          <div>
            <h2 className="text-base font-medium text-foreground">{t("pilotsH")}</h2>
            <p className="mt-3">{t("pilotsP")}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("execH")}</h2>
            <p className="mt-3">{t("execP")}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("notH")}</h2>
            <p className="mt-3">{t("notP")}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("contactH")}</h2>
            <p className="mt-3">
              {t.rich("contactP", {
                sales: (chunks) => <a href="mailto:eray@aegisora.org" className="underline underline-offset-4">{chunks}</a>,
              })}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}