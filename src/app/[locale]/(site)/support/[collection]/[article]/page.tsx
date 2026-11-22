import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { meta } from "@/lib/seo";
import { SupportSidebar } from "@/components/aegisora/support/support-sidebar";
import { ArticleBody } from "@/components/aegisora/support/article-body";
import { CopyPage } from "@/components/aegisora/support/copy-page";
import { Cta, Hero, Sec } from "@/components/aegx/ui";
import {
  articleHref,
  collectionHref,
  findArticle,
  findCollection,
  headingsOf,
  neighbours,
  readMinutes,
  toMarkdown,
  updatedFor,
} from "@/lib/support-content";

type Props = { params: Promise<{ locale: string; collection: string; article: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, collection, article } = await params;
  const a = findArticle(collection, article, locale);
  return meta(a ? a.title + " | Support" : "Support", a ? a.summary : "Aegisora help center");
}

export default async function ArticlePage({ params }: Props) {
  const { locale, collection, article } = await params;
  const t = await getTranslations({ locale, namespace: "HelpCenter" });
  const c = findCollection(collection, locale);
  const a = findArticle(collection, article, locale);
  if (!c || !a) notFound();
  const toc = headingsOf(a);
  const { prev, next } = neighbours(c.slug, a.slug, locale);
  return (
    <>
      <Hero compact badge={c.title} title={a.title} intro={a.summary} />
      <Sec flush>
        <div className={"aegx-sup" + (toc.length >= 2 ? " aegx-sup--toc" : "")}>
          <aside className="aegx-sup__side"><SupportSidebar collection={c.slug} article={a.slug} locale={locale} /></aside>

          <article className="aegx-sup__main">
            <div className="aegx-sup__meta">
              <span>
                <a href={collectionHref(c.slug, locale)}>{c.title}</a>
                {" \u00b7 "}
                {t("updated", { date: updatedFor(locale), n: readMinutes(a) })}
              </span>
              <CopyPage text={toMarkdown(a, locale)} />
            </div>

            <ArticleBody blocks={a.body} locale={locale} />

            {(prev || next) ? (
              <div className="aegx-sup__pn">
                {prev ? (
                  <a href={articleHref(c.slug, prev.slug, locale)}>
                    <small><ArrowLeft aria-hidden="true" /> {t("prev")}</small>
                    <b>{prev.title}</b>
                  </a>
                ) : <span />}
                {next ? (
                  <a href={articleHref(c.slug, next.slug, locale)} style={{ textAlign: "right" }}>
                    <small style={{ justifyContent: "flex-end" }}>{t("next")} <ArrowRight aria-hidden="true" /></small>
                    <b>{next.title}</b>
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>

          {toc.length >= 2 ? (
            <aside className="aegx-sup__toc">
              <p>{t("onPage")}</p>
              <ul>
                {toc.map((h) => (<li key={h.id}><a href={"#" + h.id}>{h.text}</a></li>))}
              </ul>
            </aside>
          ) : null}
        </div>
      </Sec>
      <Cta title={t("stillHelp")} body={t("stillBody")} primary={{ label: t("contactUs"), href: "/pilot" }} />
    </>
  );
}