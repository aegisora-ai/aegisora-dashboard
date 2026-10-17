import { COLLECTIONS, articleHref, collectionHref } from "@/lib/support-content";

export function SupportSidebar({ collection, article }: { collection: string; article?: string }) {
  return (
    <nav aria-label="Support topics" className="space-y-1 text-sm">
      {COLLECTIONS.map((c) => {
        const Icon = c.icon;
        const open = c.slug === collection;
        return (
          <div key={c.slug}>
            <a
              href={collectionHref(c.slug)}
              className={"flex items-center gap-2.5 rounded-lg px-3 py-2 font-semibold transition hover:bg-surface-3 " + (open ? "bg-surface-3" : "")}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {c.title}
            </a>
            {open ? (
              <ul className="ml-5 mt-1 space-y-0.5 border-l border-border pl-3">
                {c.articles.map((a) => (
                  <li key={a.slug}>
                    <a
                      href={articleHref(c.slug, a.slug)}
                      className={"block rounded px-2 py-1.5 transition hover:text-primary " + (a.slug === article ? "font-semibold text-primary" : "aeg-body-text")}
                    >
                      {a.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}