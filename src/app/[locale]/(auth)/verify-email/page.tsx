import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return { title: t("verify.title") };
}

export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return (
    <div className="w-full max-w-sm">
      <h1 className="bw-auth__h1">{t("verify.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("verify.desc")}</p>
      <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {t("verify.back")}
      </Link>
    </div>
  );
}