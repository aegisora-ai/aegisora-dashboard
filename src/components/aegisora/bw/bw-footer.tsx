import "./aeg-chrome.css";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/aegisora/social-links";
import { bwFontVars } from "./bw-font-vars";
import { BwBrand } from "./bw-brand";

const COLS: { key: string; links: [string, string][] }[] = [
  {
    key: "product",
    links: [
      ["platform", "/product"],
      ["solutions", "/solutions"],
      ["demo", "/demo"],
      ["pricing", "/pricing"],
      ["enterprise", "/enterprise"],
    ],
  },
  {
    key: "developers",
    links: [
      ["intro", "/docs"],
      ["quickstart", "/docs/quickstart"],
      ["technical", "/docs/technical"],
      ["changelog", "/docs/technical#releases"],
      ["support", "/support"],
    ],
  },
  {
    key: "company",
    links: [
      ["about", "/about"],
      ["contact", "/pilot"],
      ["security", "/security"],
      ["trust", "/trust"],
      ["blog", "/blog"],
    ],
  },
  {
    key: "legal",
    links: [
      ["privacy", "/trust/privacy"],
      ["terms", "/terms"],
      ["impressum", "/impressum"],
      ["subprocessors", "/trust/subprocessors"],
    ],
  },
];

export function BwFooter() {
  const t = useTranslations("Footer");
  return (
    <footer className={"bw-root aegf " + bwFontVars}>
      <div className="aegf__grid">
        <div className="aegf__brand">
          <BwBrand />
          <p className="aegf__tag">{t("tagline")}</p>
          <Link href="/signup" className="aegf__btn">
            {t("getStarted")}
            <ArrowRight aria-hidden="true" />
          </Link>
          <p className="aegf__note">{t("note")}</p>
        </div>
        {COLS.map((col) => (
          <nav key={col.key} className="aegf__col" aria-label={t("cols." + col.key)}>
            <h2>{t("cols." + col.key)}</h2>
            <ul>
              {col.links.map(([k, href]) => (
                <li key={k}>
                  <Link href={href}>{t("links." + k)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="aegf__social" role="group" aria-label={t("socialAria")}>
        <SocialLinks className="justify-center" />
      </div>
      <div className="aegf__legal">
        <div className="aegf__legalin">
          <span>&copy; {new Date().getFullYear()} Aegisora. {t("rights")}</span>
          <span>{t("sample")}</span>
        </div>
      </div>
      <div className="aegf__word" aria-hidden="true">
        <span>Aegisora</span>
      </div>
    </footer>
  );
}