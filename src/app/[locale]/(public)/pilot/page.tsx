import type { Metadata } from "next";
import PageView from "../../../../components/aegisora/site/PageView";
import { PAGES, PAGES_DE } from "../../../../components/aegisora/site/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = locale === "de" ? PAGES_DE.pilot : PAGES.pilot;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    robots: page.noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = locale === "de" ? PAGES_DE.pilot : PAGES.pilot;
  return <PageView page={page} locale={locale} />;
}