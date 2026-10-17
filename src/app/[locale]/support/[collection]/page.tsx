import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { meta } from "@/lib/seo";
import { SupportShell } from "@/components/aegisora/support/support-shell";
import { SupportSidebar } from "@/components/aegisora/support/support-sidebar";
import { articleHref, findCollection, readMinutes } from "@/lib/support-content";

type Props = { params: Promise<{ locale: string; collection: string }> };

export async function generateMetadata({ params }: Props) {
  const { collection } = await params;
  const c = findCollection(collection);
  return meta(c ? c.title + " | Support" : "Support", c ? c.desc : "Aegisora help center");
}

export default async function CollectionPage({ params }: Props) {
  const { collection } = await params;
  const c = findCollection(collection);
  if (!c) notFound();
  const Icon = c.icon;
  return (
    <SupportShell>
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <SupportSidebar collection={c.slug} />
          </div>
        </aside>
        <section>
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/support" className="hover:text-primary">Support</Link>
            <span className="mx-2">/</span>
            <span>{c.title}</span>
          </nav>
          <Icon className="mt-8 size-8" aria-hidden />
          <h1 className="aeg-display mt-4 text-4xl sm:text-5xl">{c.title}</h1>
          <p className="aeg-body-text mt-4 max-w-2xl text-lg leading-relaxed">{c.desc}</p>
          <ul className="mt-10 border-t border-border">
            {c.articles.map((a) => (
              <li key={a.slug} className="border-b border-border">
                <a href={articleHref(c.slug, a.slug)} className="group flex items-center justify-between gap-4 py-5">
                  <span>
                    <span className="block text-base font-semibold group-hover:text-primary">{a.title}</span>
                    <span className="aeg-body-text mt-1 block text-sm">{a.summary}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{readMinutes(a)} min read</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SupportShell>
  );
}