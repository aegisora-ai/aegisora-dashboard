import { ArrowRight, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { meta } from "@/lib/seo";
import { SupportSearch } from "@/components/aegisora/support/support-search";
import { Cta, Hero, Sec, SectionHead } from "@/components/aegx/ui";
import { articleHref, collectionHref, collectionsFor, popularArticles, searchIndex } from "@/lib/support-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HelpCenter" });
  return meta(t("metaTitle"), t("metaDesc"));
}

export default async function SupportHome({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HelpCenter" });
  const popular = popularArticles(locale);
  const index = searchIndex(locale);
  const collections = collectionsFor(locale);
  const missing = collections.length % 2 === 0 ? 0 : 1;
  return (
    <>
      <Hero compact badge={t("eyebrow")} title={t("h1")} />

      <Sec flush>
        <div className="aegx-sup-searchwrap"><SupportSearch items={index} /></div>
      </Sec>

      <Sec flush>
        <div className="aegx-tabs"><span style={{ fontSize: 13, color: "#a3a3a3" }}>{t("popular")}</span></div>
        <ul className="aegx-sup-list">
          {popular.map((p) => (
            <li key={p.href}>
              <a href={p.href}><span>{p.title}</span><FileText aria-hidden="true" /></a>
            </li>
          ))}
        </ul>
      </Sec>

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead title={t("collections")} />
        </div>
        <div className="aegx-cells aegx-cells--2">
          {collections.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.slug} className="aegx-cell">
                <span className="aegx-ico"><Icon aria-hidden="true" /></span>
                <h3 className="aegx-h3"><a href={collectionHref(c.slug, locale)}>{c.title}</a></h3>
                <p className="aegx-p">{c.desc}</p>
                <ul className="aegx-sup-mini">
                  {c.articles.slice(0, 3).map((a) => (
                    <li key={a.slug}><a href={articleHref(c.slug, a.slug, locale)}>{a.title}</a></li>
                  ))}
                </ul>
                <a href={collectionHref(c.slug, locale)} className="aegx-sup-more">
                  {t("viewAll", { n: c.articles.length })} <ArrowRight aria-hidden="true" />
                </a>
              </div>
            );
          })}
          {Array.from({ length: missing }).map((_, i) => (<div key={"f" + i} className="aegx-cell aegx-cell--fill" aria-hidden="true" />))}
        </div>
      </Sec>

      <Cta title={t("cantFind")} body={t("cantFindBody")} primary={{ label: t("contactUs"), href: "/pilot" }} />
    </>
  );
}