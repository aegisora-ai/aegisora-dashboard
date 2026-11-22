import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgImpressum" });
  return { title: t("metaTitle") };
}

export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgImpressum" });
  return (
    <>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm opacity-70">{t("sub")}</p>

        <h2 className="mt-10 text-lg font-semibold">{t("providerH")}</h2>
        <p className="mt-2 leading-relaxed">
          Eray &Ouml;zer<br />
          {t("trade")}<br />
          Zurmaiener Stra&szlig;e 98<br />
          54292 Trier<br />
          {t("country")}
        </p>

        <h2 className="mt-8 text-lg font-semibold">{t("contactH")}</h2>
        <p className="mt-2 leading-relaxed">
          {t("email")}: <a className="underline" href="mailto:eray@aegisora.org">eray@aegisora.org</a><br />
          {t("form")}: <Link className="underline" href="/pilot">aegisora.org/pilot</Link>
        </p>

        <h2 className="mt-8 text-lg font-semibold">{t("respH")}</h2>
        <p className="mt-2 leading-relaxed">
          Eray &Ouml;zer, Zurmaiener Stra&szlig;e 98, 54292 Trier, {t("country")}
        </p>

        <h2 className="mt-8 text-lg font-semibold">{t("disputeH")}</h2>
        <p className="mt-2 leading-relaxed">{t("disputeP")}</p>
      </div>
    </>
  );
}