import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero, Section } from "@/components/aegisora/page-kit";
import { DraftNotice } from "@/components/aegisora/draft-notice";
import { meta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgPrivacy" });
  return meta(t("metaTitle"), t("metaDesc"));
}

const mail = (addr: string) => {
  const MailLink = (chunks: React.ReactNode) => (
    <a href={"mailto:" + addr} className="underline underline-offset-4">{chunks}</a>
  );
  return MailLink;
};

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgPrivacy" });
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <Section>
        <DraftNotice>{t("draft")}</DraftNotice>
        <div className="max-w-2xl space-y-8 text-sm leading-6 text-muted-foreground">
          <div>
            <h2 className="text-base font-medium text-foreground">{t("controllerH")}</h2>
            <p className="mt-3">{t.rich("controllerP", { eray: mail("eray@aegisora.org") })}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("whatH")}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>{t("w1")}</li>
              <li>{t("w2")}</li>
              <li>{t("w3")}</li>
              <li>{t("w4")}</li>
              <li>{t("w5")}</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("payH")}</h2>
            <p className="mt-3">{t("payP")}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("purH")}</h2>
            <p className="mt-3">{t("purP")}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("cookH")}</h2>
            <p className="mt-3">{t("cookP")}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("retH")}</h2>
            <p className="mt-3">{t("retP")}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("provH")}</h2>
            <p className="mt-3">
              {t.rich("provP", {
                sub: (chunks) => <Link href="/trust/subprocessors" className="underline underline-offset-4">{chunks}</Link>,
              })}
            </p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">{t("rightsH")}</h2>
            <p className="mt-3">{t.rich("rightsP", { hello: mail("eray@aegisora.org") })}</p>
          </div>
        </div>
      </Section>
    </>
  );
}
