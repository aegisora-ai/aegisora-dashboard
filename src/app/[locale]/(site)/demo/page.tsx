import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LiveDemo } from "@/components/aegisora/bw/live-demo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Demo" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Demo" });
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t("pageTitle")}</h1>
      <p className="mt-3 mb-8 max-w-2xl text-muted-foreground">{t("pageIntro")}</p>
      <LiveDemo />
    </div>
  );
}