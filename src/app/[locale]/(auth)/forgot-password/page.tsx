import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/aegisora/auth-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return { title: t("forgot.title") };
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return (
    <AuthForm
      mode="reset"
      title={t("forgot.title")}
      description={t("forgot.desc")}
      fields={[{ name: "email", label: t("common.workEmail"), type: "email", autoComplete: "email" }]}
      submitLabel={t("forgot.submit")}
      redirectTo="/login"
      links={[{ text: t("forgot.remembered"), label: t("forgot.logIn"), href: "/login" }]}
    />
  );
}