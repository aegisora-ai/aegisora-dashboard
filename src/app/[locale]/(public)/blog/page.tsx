import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";
import { POSTS } from "@/lib/blog-posts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  return (
    <>
      <PageHero eyebrow={t("metaTitle")} title={t("title")} intro={t("intro")} />
      <Section title={t("latest")} tone="alt">
        <CardGrid
          cols={3}
          items={POSTS.map((p) => ({
            n: p.category + " \u00b7 " + fmt(p.date),
            title: p.title,
            body: p.excerpt + " (" + t("minRead", { n: p.readMinutes }) + ")",
            href: "/blog/" + p.slug,
          }))}
        />
      </Section>
      <CtaBand
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("test"), href: "/signup" }}
        secondary={{ label: t("quick"), href: "/docs/quickstart" }}
      />
    </>
  );
}