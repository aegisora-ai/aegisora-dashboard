import { getTranslations, setRequestLocale } from "next-intl/server";
import "@/components/aegisora/bw/bw.css";
import { bwFontVars } from "@/components/aegisora/bw/bw-font-vars";
import { DocsFrame } from "@/components/aegisora/docs-frame";
import { DocsNav } from "@/components/aegisora/docs-nav";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Docs" });
  return (
    <div className={bwFontVars}>
      <DocsFrame menu={t("menu")} nav={<DocsNav />}>
        {children}
      </DocsFrame>
    </div>
  );
}