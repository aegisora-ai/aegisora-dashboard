import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/aegisora/social-links";
import { AegxBrand } from "./brand";

const COLS: { key: string; links: [string, string][] }[] = [
  { key: "product", links: [["platform", "/product"], ["solutions", "/solutions"], ["demo", "/demo"], ["pricing", "/pricing"], ["enterprise", "/enterprise"]] },
  { key: "developers", links: [["intro", "/docs"], ["quickstart", "/docs/quickstart"], ["technical", "/docs/technical"], ["changelog", "/docs/technical#releases"], ["support", "/support"]] },
  { key: "company", links: [["about", "/about"], ["contact", "/pilot"], ["security", "/security"], ["trust", "/trust"], ["blog", "/blog"], ["careers", "/careers"]] },
  { key: "legal", links: [["privacy", "/trust/privacy"], ["terms", "/terms"], ["impressum", "/impressum"], ["subprocessors", "/trust/subprocessors"]] },
];

export function AegxFooter() {
  const t = useTranslations("Footer");
  const de = useLocale() === "de";
  return (
    <>
      <section className="aegx-sec">
        <div className="aegx-col">
          <div className="aegx-loop">
            <p><b>{de ? "Bleib auf dem Laufenden." : "Stay in the loop."}</b> {de ? "Neue Funktionen und Releases im Blick." : "Follow new features and releases."}</p>
            <Link href="/changelog" className="aegx-btn aegx-btn--soft aegx-btn--sm">{de ? "Updates ansehen" : "See updates"}</Link>
          </div>
        </div>
      </section>
      <footer className="aegx-sec aegx-foot">
        <div className="aegx-col">
          <div className="aegx-foot__grid">
            <div className="aegx-foot__brand">
              <AegxBrand height={24} />
              <p>{t("tagline")}</p>
              <div className="aegx-foot__social" role="group" aria-label={t("socialAria")}>
                <SocialLinks />
              </div>
              <p className="aegx-foot__note">{t("note")}</p>
            </div>
            {COLS.map((col) => (
              <nav key={col.key} className="aegx-foot__col" aria-label={t("cols." + col.key)}>
                <h2>{t("cols." + col.key)}</h2>
                <ul>
                  {col.links.map(([k, href]) => (
                    <li key={k}><Link href={href}>{t("links." + k)}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="aegx-foot__legal">
            <span>&copy; {new Date().getFullYear()} Aegisora. {t("rights")}</span>
          </div>
        </div>
      </footer>
    </>
  );
}