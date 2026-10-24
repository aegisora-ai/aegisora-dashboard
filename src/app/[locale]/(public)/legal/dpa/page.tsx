import type { Metadata } from "next";
import PageView from "../../../../../components/aegisora/site/PageView";
import { PAGES } from "../../../../../components/aegisora/site/content";

const page = PAGES.legalDpa;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  robots: page.noindex ? { index: false, follow: false } : undefined,
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PageView page={page} locale={locale} />;
}