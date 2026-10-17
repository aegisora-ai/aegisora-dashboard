import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { meta } from "@/lib/seo";
import { SupportShell } from "@/components/aegisora/support/support-shell";
import { articleHref, findCollection } from "@/lib/support-content";

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
  return (
    <SupportShell>
      <section className="mx-auto max-w-[900px] px-4 pt-14 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/support" className="hover:text-primary">Support</Link>
          <span className="mx-2">/</span>
          <span>{c.title}</span>
        </nav>
        <h1 className="aeg-display mt-6 text-4xl sm:text-5xl">{c.title}</h1>
        <p className="aeg-body-text mt-4 max-w-2xl text-lg leading-relaxed">{c.desc}</p>
        <ul className="mt-10 border-t border-border">
          {c.articles.map((a) => (
            <li key={a.slug} className="border-b border-border">
              <Link href={articleHref(c.slug, a.slug)} className="group flex items-center justify-between gap-4 py-5">
                <span>
                  <span className="block text-base font-semibold group-hover:text-primary">{a.title}</span>
                  <span className="aeg-body-text mt-1 block text-sm">{a.summary}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SupportShell>
  );
}