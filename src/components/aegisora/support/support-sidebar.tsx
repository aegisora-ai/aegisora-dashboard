import { getTranslations } from "next-intl/server";
import { articleHref, collectionHref, collectionsFor } from "@/lib/support-content";

export async function SupportSidebar({ collection, article, locale }: { collection: string; article?: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "HelpCenter" });
  return (
    <nav aria-label={t("topics")} className="aegx-sup-nav">
      {collectionsFor(locale).map((c) => {
        const Icon = c.icon;
        const open = c.slug === collection;
        return (
          <div key={c.slug}>
            <a href={collectionHref(c.slug, locale)} className={"aegx-sup-nav__c" + (open ? " is-on" : "")}>
              <Icon aria-hidden="true" />
              {c.title}
            </a>
            {open ? (
              <ul className="aegx-sup-nav__l">
                {c.articles.map((a) => (
                  <li key={a.slug}>
                    <a href={articleHref(c.slug, a.slug, locale)} className={a.slug === article ? "is-on" : ""}>{a.title}</a>
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