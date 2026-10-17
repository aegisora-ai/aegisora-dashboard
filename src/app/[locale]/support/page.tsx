import { ArrowRight, FileText } from "lucide-react";
import { meta } from "@/lib/seo";
import { SupportShell } from "@/components/aegisora/support/support-shell";
import { SupportSearch } from "@/components/aegisora/support/support-search";
import { COLLECTIONS, MAIN_SITE, articleHref, collectionHref, popularArticles, searchIndex } from "@/lib/support-content";

export const metadata = meta(
  "Support",
  "Help center for Aegisora: getting started, policies and decisions, access and security, pilots and pricing, and Aeri voice.",
);

export default function SupportHome() {
  const popular = popularArticles();
  const index = searchIndex();
  return (
    <SupportShell>
      <section className="mx-auto max-w-[1100px] px-4 pb-8 pt-16 sm:px-6 md:pt-20">
        <p className="aeg-eyebrow text-xs text-primary">AEGISORA SUPPORT</p>
        <h1 className="aeg-display mt-4 max-w-2xl text-5xl sm:text-6xl">Search for answers or browse by topic</h1>
        <div className="mt-10">
          <SupportSearch items={index} />
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-6">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">POPULAR ARTICLES</h2>
        <ul className="border-t border-border">
          {popular.map((p) => (
            <li key={p.href} className="border-b border-border">
              <a href={p.href} className="flex items-center justify-between gap-4 py-4 text-base font-semibold transition hover:text-primary">
                {p.title}
                <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 pt-16 sm:px-6">
        <h2 className="aeg-display text-3xl sm:text-4xl">Collections</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.slug} className="flex flex-col rounded-2xl border border-border bg-surface-1 transition hover:border-primary">
                <div className="p-6">
                  <Icon className="size-6" aria-hidden />
                </div>
                <div className="flex flex-1 flex-col border-t border-border p-6">
                  <h3 className="text-lg font-semibold">
                    <a href={collectionHref(c.slug)} className="hover:text-primary">{c.title}</a>
                  </h3>
                  <p className="aeg-body-text mt-3 text-sm leading-6">{c.desc}</p>
                  <ul className="mt-4 space-y-1.5">
                    {c.articles.slice(0, 3).map((a) => (
                      <li key={a.slug}>
                        <a href={articleHref(c.slug, a.slug)} className="text-sm font-medium hover:text-primary">{a.title}</a>
                      </li>
                    ))}
                  </ul>
                  <a href={collectionHref(c.slug)} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold text-primary">
                    View all {c.articles.length} {c.articles.length === 1 ? "article" : "articles"} <ArrowRight className="size-3.5" aria-hidden />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 pt-16 sm:px-6">
        <div className="aeg-night flex flex-wrap items-center justify-between gap-6 rounded-3xl p-8 md:p-10">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold">Can&apos;t find what you need?</h2>
            <p className="mt-2 text-sm text-[#a9bbdb]">Tell the team what you were trying to do and what happened instead.</p>
          </div>
          <a href={MAIN_SITE + "/contact"} className="inline-flex h-11 items-center rounded bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            Contact us
          </a>
        </div>
      </section>
    </SupportShell>
  );
}