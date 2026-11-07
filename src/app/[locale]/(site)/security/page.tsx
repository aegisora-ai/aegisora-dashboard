import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { KeyRound, ScrollText, ShieldCheck, UserCheck } from "lucide-react";
import { meta } from "@/lib/seo";
import { Cell, Cells, Cta, Feed, Hero, Sec, SectionHead } from "@/components/aegx/ui";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PgSecurity" });
  return meta(t("metaTitle"), t("intro"));
}

export default async function SecurityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "PgSecurity" });
  const dot = " \u00b7 ";
  const feedTitle = locale === "de" ? "Beispiel-Entscheidungen" : "Example decisions";
  return (
    <>
      <Hero
        badge={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
        primary={{ label: t("primary"), href: "/signup" }}
        secondary={{ label: t("secondary"), href: "/proof" }}
      >
        <Feed
          title={feedTitle}
          rows={[
            { action: "crm.read_ticket", meta: "support-agent" + dot + t("r1"), v: "ALLOW" },
            { action: "files.export salary.csv", meta: "hr-agent" + dot + t("r2"), v: "ESCALATE" },
            { action: "customers.delete bulk", meta: "billing-agent" + dot + t("r3"), v: "BLOCK" },
          ]}
        />
      </Hero>

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={t("secEyebrow")} title={t("secTitle")} />
        </div>
        <Cells n={4}>
          <Cell icon={KeyRound} title={t("c1t")}>{t("c1b")}</Cell>
          <Cell icon={ShieldCheck} title={t("c2t")}>{t("c2b")}</Cell>
          <Cell icon={UserCheck} title={t("c3t")}>{t("c3b")}</Cell>
          <Cell icon={ScrollText} title={t("c4t")}>{t("c4b")}</Cell>
        </Cells>
      </Sec>

      <Cta
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("ctaPrimary"), href: "/trust" }}
        secondary={{ label: t("ctaSecondary"), href: "/pilot" }}
      />
    </>
  );
}