import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { meta } from "@/lib/seo";
import { SupportSidebar } from "@/components/aegisora/support/support-sidebar";
import { Hero, Sec } from "@/components/aegx/ui";
import { articleHref, findCollection, readMinutes } from "@/lib/support-content";

type Props = { params: Promise<{ locale: string; collection: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, collection } = await params;
  const c = findCollection(collection, locale);
  return meta(c ? c.title + " | Support" : "Support", c ? c.desc : "Aegisora help center");
}

export default async function CollectionPage({ params }: Props) {
  const { locale, collection } = await params;
  const t = await getTranslations({ locale, namespace: "HelpCenter" });
  const c = findCollection(collection, locale);
  if (!c) notFound();
  return (
    <>
      <Hero compact badge={t("label")} title={c.title} intro={c.desc} />
      <Sec flush>
        <div className="aegx-sup">
          <aside className="aegx-sup__side"><SupportSidebar collection={c.slug} locale={locale} /></aside>
          <section className="aegx-sup__main">
            <ul className="aegx-sup-list aegx-sup-list--flat">
              {c.articles.map((a) => (
                <li key={a.slug}>
                  <a href={articleHref(c.slug, a.slug, locale)}>
                    <span>
                      <b>{a.title}</b>
                      <small>{a.summary}</small>
                      <em>{t("minRead", { n: readMinutes(a) })}</em>
                    </span>
                    <ChevronRight aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Sec>
    </>
  );
}