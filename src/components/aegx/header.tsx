"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BwLocaleSwitcher } from "@/components/aegisora/bw/bw-locale-switcher";
import { AegxBrand } from "./brand";

const NAV = [
  { key: "product", href: "/product" },
  { key: "security", href: "/security" },
  { key: "pricing", href: "/pricing" },
  { key: "docs", href: "/docs" },
  { key: "pilot", href: "/pilot" },
];

export function AegxHeader() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const signIn = locale === "de" ? "Anmelden" : "Sign in";

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const on = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="aegx-head">
        <div className="aegx-head__in">
          <Link href="/" className="aegx-head__brand" aria-label={t("homeAria")} onClick={() => setOpen(false)}>
            <AegxBrand height={24} />
          </Link>
          <nav className="aegx-nav" aria-label={t("mainAria")}>
            {NAV.map((n) => (
              <Link key={n.key} href={n.href} aria-current={on(n.href) ? "page" : undefined}>
                {t("items." + n.key)}
              </Link>
            ))}
          </nav>
          <div className="aegx-head__right">
            <BwLocaleSwitcher />
            <Link href="/login" className="aegx-head__signin">{signIn}</Link>
            <Link href="/signup" className="aegx-btn aegx-btn--solid aegx-btn--sm">{t("testAegisora")}</Link>
            <button
              type="button"
              className="aegx-burger"
              aria-label={open ? t("menuClose") : t("menuOpen")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      {open ? (
        <div className="aegx-drawer" role="dialog" aria-modal="true" aria-label={t("drawerAria")}>
          <nav aria-label={t("mainAria")}>
            {NAV.map((n) => (
              <Link key={n.key} href={n.href} onClick={() => setOpen(false)}>
                {t("items." + n.key)}
              </Link>
            ))}
          </nav>
          <div className="aegx-drawer__cta">
            <Link href="/login" className="aegx-btn aegx-btn--soft" onClick={() => setOpen(false)}>{signIn}</Link>
            <Link href="/signup" className="aegx-btn aegx-btn--solid" onClick={() => setOpen(false)}>{t("testAegisora")}</Link>
          </div>
        </div>
      ) : null}
    </>
  );
}