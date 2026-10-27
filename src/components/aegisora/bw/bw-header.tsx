"use client";

import "./aeg-chrome.css";
import "./bw-drawer.css";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { bwFontVars } from "./bw-font-vars";
import { BwBrand } from "./bw-brand";
import { BwLocaleSwitcher } from "./bw-locale-switcher";
import { BwThemeToggle } from "./bw-theme-toggle";

type Child = { key: string; href: string };
type Item = { key: string; href: string; children?: Child[] };

const NAV: Item[] = [
  { key: "home", href: "/" },
  {
    key: "product",
    href: "/product",
    children: [
      { key: "platform", href: "/product" },
      { key: "solutions", href: "/solutions" },
      { key: "proof", href: "/proof" },
      { key: "security", href: "/security" },
      { key: "enterprise", href: "/enterprise" },
      { key: "pilot", href: "/pilot" },
    ],
  },
  { key: "demo", href: "/demo" },
  { key: "pricing", href: "/pricing" },
  {
    key: "docs",
    href: "/docs",
    children: [
      { key: "intro", href: "/docs" },
      { key: "quickstart", href: "/docs/quickstart" },
      { key: "technical", href: "/docs/technical" },
      { key: "developers", href: "/developers" },
      { key: "support", href: "/support" },
      { key: "changelog", href: "/changelog" },
      { key: "blog", href: "/blog" },
    ],
  },
];

export function BwHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState<Record<string, boolean>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [drawer]);

  /* Pencere genisleyip burger gizlenirse acik menuyu kapat. */
  useEffect(() => {
    if (!drawer) return;
    const check = () => {
      const b = burgerRef.current;
      if (b && window.getComputedStyle(b).display === "none") setDrawer(false);
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [drawer]);

  const close = () => {
    setOpen(null);
    setDrawer(false);
  };

  const match = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const isActive = (item: Item) => (item.href === "/" ? pathname === "/" : [item.href, ...(item.children ?? []).map((c) => c.href)].some(match));

  /* Menu document.body'ye cizilir: header'daki backdrop-filter fixed konumu bozamaz. */
  const drawerEl =
    drawer && typeof document !== "undefined"
      ? createPortal(
          <div className={"bw-root aegd " + bwFontVars} role="dialog" aria-modal="true" aria-label={t("drawerAria")}>
            <div className="aegd__top">
              <Link href="/" className="aegd__brand" aria-label={t("homeAria")} onClick={close}>
                <BwBrand />
              </Link>
              <BwLocaleSwitcher />
              <BwThemeToggle />
              <button type="button" className="aegd__icon" aria-label={t("menuClose")} onClick={close}>
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="aegd__body">
              {NAV.map((item) => {
                const expanded = !!acc[item.key];
                return (
                  <div key={item.key} className="aegd__group">
                    <div className="aegd__row">
                      <Link href={item.href} className={"aegd__link" + (isActive(item) ? " is-active" : "")} onClick={close}>
                        {t("items." + item.key)}
                      </Link>
                      {item.children ? (
                        <button
                          type="button"
                          className={"aegd__chev" + (expanded ? " is-open" : "")}
                          aria-expanded={expanded}
                          aria-label={t("items." + item.key)}
                          onClick={() => setAcc({ ...acc, [item.key]: !expanded })}
                        >
                          <ChevronDown aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                    {item.children && expanded ? (
                      <div className="aegd__sub">
                        {item.children.map((c) => (
                          <Link key={c.key} href={c.href} className="aegd__sublink" onClick={close}>
                            {t("items." + c.key)}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <div className="aegd__cta">
                <Link href="/signup" className="aegd__btn" onClick={close}>
                  {t("testAegisora")}
                </Link>
                <Link href="/enterprise" className="aegd__btn aegd__btn--ghost" onClick={close}>
                  {t("contact")}
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className={"bw-root aegh " + bwFontVars}>
        <div className="aegh__bar" ref={rootRef}>
          <Link href="/" className="aegh__brand" aria-label={t("homeAria")} onClick={close}>
            <BwBrand />
          </Link>

          <nav className="aegh__nav" aria-label={t("mainAria")}>
            {NAV.map((item) =>
              item.children ? (
                <div
                  key={item.key}
                  className="aegh__item"
                  onMouseEnter={() => setOpen(item.key)}
                  onMouseLeave={() => setOpen(null)}
                >
                  <Link href={item.href} className={"aegh__link" + (isActive(item) ? " is-active" : "")} onClick={close}>
                    {t("items." + item.key)}
                  </Link>
                  <button
                    type="button"
                    className={"aegh__chev" + (open === item.key ? " is-open" : "")}
                    aria-label={t("items." + item.key)}
                    aria-haspopup="true"
                    aria-expanded={open === item.key}
                    onClick={() => setOpen(open === item.key ? null : item.key)}
                  >
                    <ChevronDown aria-hidden="true" />
                  </button>
                  {open === item.key ? (
                    <div className="aegh__menu" role="menu">
                      <div className="aegh__menu-in">
                        {item.children.map((c) => (
                          <Link key={c.key} href={c.href} role="menuitem" className="aegh__mi" onClick={close}>
                            <b>{t("items." + c.key)}</b>
                            <span>{t("desc." + c.key)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div key={item.key} className="aegh__item">
                  <Link href={item.href} className={"aegh__link" + (isActive(item) ? " is-active" : "")} onClick={close}>
                    {t("items." + item.key)}
                  </Link>
                </div>
              ),
            )}
          </nav>

          <div className="aegh__right">
            <BwLocaleSwitcher />
            <BwThemeToggle />
            <Link href="/enterprise" className="aegh__btn aegh__btn--ghost aegh__hide-md" onClick={close}>
              {t("contact")}
            </Link>
            <Link href="/signup" className="aegh__btn aegh__hide-md" onClick={close}>
              {t("testAegisora")}
            </Link>
            <button
              ref={burgerRef}
              type="button"
              className="aegh__icon aegh__burger"
              aria-label={drawer ? t("menuClose") : t("menuOpen")}
              aria-expanded={drawer}
              onClick={() => setDrawer(!drawer)}
            >
              {drawer ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      {drawerEl}
    </>
  );
}