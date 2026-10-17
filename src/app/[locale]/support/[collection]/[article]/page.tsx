import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { meta } from "@/lib/seo";
import { SupportShell } from "@/components/aegisora/support/support-shell";
import { SupportSidebar } from "@/components/aegisora/support/support-sidebar";
import { ArticleBody } from "@/components/aegisora/support/article-body";
import { CopyPage } from "@/components/aegisora/support/copy-page";
import {
  MAIN_SITE,
  UPDATED,
  articleHref,
  collectionHref,
  findArticle,
  findCollection,
  headingsOf,
  neighbours,
  readMinutes,
  toMarkdown,
} from "@/lib/support-content";

type Props = { params: Promise<{ locale: string; collection: string; article: string }> };

export async function generateMetadata({ params }: Props) {
  const { collection, article } = await params;
  const a = findArticle(collection, article);
  return meta(a ? a.title + " | Support" : "Support", a ? a.summary : "Aegisora help center");
}

export default async function ArticlePage({ params }: Props) {
  const { collection, article } = await params;
  const c = findCollection(collection);
  const a = findArticle(collection, article);
  if (!c || !a) notFound();
  const toc = headingsOf(a);
  const { prev, next } = neighbours(c.slug, a.slug);
  return (
    <SupportShell>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_200px]">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <SupportSidebar collection={c.slug} article={a.slug} />
          </div>
        </aside>

        <article className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/support" className="hover:text-primary">Support</Link>
            <span className="mx-2">/</span>
            <a href={collectionHref(c.slug)} className="hover:text-primary">{c.title}</a>
          </nav>
          <h1 className="aeg-display mt-6 text-4xl sm:text-5xl">{a.title}</h1>
          <p className="aeg-body-text mt-4 text-lg leading-relaxed">{a.summary}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Updated {UPDATED} · {readMinutes(a)} min read</p>
            <CopyPage text={toMarkdown(a)} />
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <ArticleBody blocks={a.body} />
          </div>

          {(prev || next) ? (
            <div className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
              {prev ? (
                <a href={articleHref(c.slug, prev.slug)} className="rounded-xl border border-border p-4 transition hover:border-primary">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ArrowLeft className="size-3.5" aria-hidden /> Previous</span>
                  <span className="mt-1 block text-sm font-semibold">{prev.title}</span>
                </a>
              ) : <span />}
              {next ? (
                <a href={articleHref(c.slug, next.slug)} className="rounded-xl border border-border p-4 text-right transition hover:border-primary">
                  <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">Next <ArrowRight className="size-3.5" aria-hidden /></span>
                  <span className="mt-1 block text-sm font-semibold">{next.title}</span>
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-10 rounded-2xl bg-surface-3 p-6">
            <h2 className="text-lg font-semibold">Still need help?</h2>
            <p className="aeg-body-text mt-2 text-sm leading-6">Tell us what you were trying to do and what happened instead.</p>
            <a href={MAIN_SITE + "/contact"} className="mt-4 inline-flex h-10 items-center rounded bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              Contact us
            </a>
          </div>
        </article>

        {toc.length >= 2 ? (
          <aside className="hidden xl:block">
            <div className="sticky top-8">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">ON THIS PAGE</p>
              <ul className="mt-3 space-y-2 border-l border-border pl-3 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={"#" + h.id} className="aeg-body-text transition hover:text-primary">{h.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </SupportShell>
  );
}