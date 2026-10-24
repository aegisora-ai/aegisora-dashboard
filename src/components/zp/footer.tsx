"use client";

import "@/styles/zp.css";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/aegisora/logo";
import { SocialIcon } from "@/components/aegisora/social-icon";
import { SOCIALS } from "@/lib/socials";
import { footerGroups } from "@/lib/main-nav";

export function ZpFooter() {
  return (
    <footer className="zp zp-footer">
      <div className="zp-container zp-footer-grid">
        <div>
          <Logo />
          <p className="zp-footer-desc">Runtime security and execution control for autonomous AI agents.</p>
          <div className="zp-btn-row" style={{ marginTop: 24 }}>
            <Link href="/pilot" className="zp-btn zp-btn--primary zp-btn--sm">
              Apply for Enterprise Pilot
            </Link>
          </div>
          <p style={{ marginTop: 12, fontSize: 12 }} className="zp-muted">
            <Link href="/signup" className="zp-textlink" style={{ fontSize: 12 }}>
              Or create a test workspace
            </Link>
          </p>
        </div>
        {footerGroups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2>{g.title}</h2>
            <ul className="zp-footer-links">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="zp-footer-bar">
        <div className="zp-container zp-footer-bar-in">
          <span>Aegisora 4.0. Examples on this site use illustrative sample data.</span>
          <span className="zp-footer-legal">
            <Link href="/trust/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/impressum">Impressum</Link>
          </span>
          <span className="zp-socials">
            {SOCIALS.map((s) =>
              s.href ? (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="zp-social"
                >
                  <SocialIcon name={s.label} className="size-[16px]" />
                </a>
              ) : (
                <span key={s.label} aria-label={s.label + " (link not set)"} className="zp-social zp-social--off">
                  <SocialIcon name={s.label} className="size-[16px]" />
                </span>
              ),
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
