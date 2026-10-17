import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { meta } from "@/lib/seo";
import { SupportShell } from "@/components/aegisora/support/support-shell";
import { ArticleBody } from "@/components/aegisora/support/article-body";
import { MAIN_SITE, articleHref, collectionHref, findArticle, findCollection } from "@/lib/support-content";

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
  const related = c.articles.filter((x) => x.slug !== a.slug);
  return (
    <SupportShell>
      <article className="mx-auto max-w-[760px] px-4 pt-14 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/support" className="hover:text-primary">Support</Link>
          <span className="mx-2">/</span>
          <Link href={collectionHref(c.slug)} className="hover:text-primary">{c.title}</Link>
        </nav>
        <h1 className="aeg-display mt-6 text-4xl sm:text-5xl">{a.title}</h1>
        <p className="aeg-body-text mt-4 text-lg leading-relaxed">{a.summary}</p>
        <div className="mt-10 border-t border-border pt-8">
          <ArticleBody blocks={a.body} />
        </div>

        {related.length > 0 ? (
          <div className="mt-14 border-t border-border pt-8">
            <h2 className="text-lg font-semibold">Related articles</h2>
            <ul className="mt-4 space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={articleHref(c.slug, r.slug)} className="text-sm font-medium hover:text-primary">{r.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-12 rounded-2xl bg-surface-3 p-6">
          <h2 className="text-lg font-semibold">Still need help?</h2>
          <p className="aeg-body-text mt-2 text-sm leading-6">Tell us what you were trying to do and what happened instead.</p>
          <a href={MAIN_SITE + "/contact"} className="mt-4 inline-flex h-10 items-center rounded bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            Contact us
          </a>
        </div>
      </article>
    </SupportShell>
  );
}