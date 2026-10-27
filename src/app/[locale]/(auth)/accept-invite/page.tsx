import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/aegisora/auth-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return { title: t("invite.title") };
}

export default async function AcceptInvitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return (
    <AuthForm
      mode="invite"
      title={t("invite.title")}
      description={t("invite.desc")}
      fields={[
        { name: "name", label: t("invite.fullName"), type: "text", autoComplete: "name" },
        { name: "password", label: t("common.password"), type: "password", autoComplete: "new-password" },
      ]}
      submitLabel={t("invite.submit")}
      redirectTo="/dashboard"
    />
  );
}