"use client";

import "@/styles/zp.css";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/aegisora/logo";
import { ThemeToggle } from "@/components/aegisora/theme-toggle";
import { SOCIALS } from "@/lib/socials";
import { headerCtas, mainNav } from "@/lib/main-nav";

const GITHUB_URL = SOCIALS.find((s) => s.label === "GitHub")?.href ?? "";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function ZpHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>


      <header className="zp zp-header">
        <div className="zp-container zp-header-in">
          <div className="zp-header-l">
            <Logo />
            <nav aria-label="Main" className="zp-nav">
              {mainNav.map((entry) =>
                entry.items ? (
                  <div key={entry.label} className="zp-nav-item">
                    <Link
                      href={entry.href}
                      aria-haspopup="true"
                      aria-current={isActive(pathname, entry.href) ? "page" : undefined}
                      className="zp-nav-link"
                    >
                      {entry.label}
                      <ChevronDown size={14} className="zp-chev" aria-hidden />
                    </Link>
                    <div className="zp-mega">
                      <div className="zp-container zp-mega-in">
                        <div>
                          <p className="zp-mega-title">{entry.label}</p>
                          <p className="zp-mega-sub">Everything in one place.</p>
                        </div>
                        <ul className="zp-mega-grid">
                          {entry.items.map((item) => (
                            <li key={item.href + item.label}>
                              <Link href={item.href} className="zp-mega-item">
                                <b>{item.label}</b>
                                {item.desc ? <span>{item.desc}</span> : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={entry.label} className="zp-nav-item">
                    <Link
                      href={entry.href}
                      aria-current={isActive(pathname, entry.href) ? "page" : undefined}
                      className="zp-nav-link"
                    >
                      {entry.label}
                    </Link>
                  </div>
                ),
              )}
            </nav>
          </div>

          <div className="zp-header-r">
            <Link href={headerCtas.primary.href} className="zp-btn zp-btn--primary zp-btn--sm zp-m-cta">
              {headerCtas.primary.label}
            </Link>
            <div className="zp-header-cta">
              <ThemeToggle />
              {GITHUB_URL ? (
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="zp-gh">
                  GitHub
                </a>
              ) : null}
              <Link href={headerCtas.login.href} className="zp-header-link">
                {headerCtas.login.label}
              </Link>
              <Link href={headerCtas.primary.href} className="zp-btn zp-btn--primary zp-btn--sm">
                {headerCtas.primary.label}
              </Link>
            </div>
            <button
              type="button"
              className="zp-burger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="zp zp-mobile">
          <nav aria-label="Mobile">
            {mainNav.map((entry) => (
              <div key={entry.label} className="zp-mobile-group">
                <Link href={entry.href}>{entry.label}</Link>
                {entry.items ? (
                  <ul>
                    {entry.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <div className="zp-mobile-cta">
              <Link href={headerCtas.primary.href} className="zp-btn zp-btn--primary">
                {headerCtas.primary.label}
              </Link>
              <Link href={headerCtas.login.href} className="zp-btn zp-btn--outline">
                {headerCtas.login.label}
              </Link>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
                <span className="zp-muted">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
