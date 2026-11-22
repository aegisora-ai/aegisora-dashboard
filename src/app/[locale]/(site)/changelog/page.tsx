import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ChangelogTimeline } from "@/components/aegisora/changelog-timeline";
import { Hero, Sec } from "@/components/aegx/ui";
import { meta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const de = locale === "de";
  return meta(
    de ? "Updates" : "Updates",
    de ? "Releases und neue Funktionen von Aegisora." : "Releases and new features in Aegisora.",
  );
}

export default async function ChangelogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const de = locale === "de";
  return (
    <>
      <Hero
        compact
        badge="Updates"
        title={de ? "Releases und Neuerungen" : "Releases and what's new"}
        intro={de ? "Jede Version von Aegisora, mit Funktionen und Pr\u00fcfungen." : "Every Aegisora release, with features and validation."}
      />
      <Sec flush>
        <ChangelogTimeline />
      </Sec>
    </>
  );
}