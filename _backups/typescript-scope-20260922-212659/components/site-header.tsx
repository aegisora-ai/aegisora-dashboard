"use client";

import { Menu, ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>
          <span className="brand-copy">
            <span className="brand-name">AEGISORA</span>
            <span className="brand-sub">runtime security</span>
          </span>
        </Link>

        <nav className="site-nav">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/proof">Live proof</Link>
          <Link href="/evidence">Evidence</Link>
          <a
            href="https://github.com/aegisora-ai/aegisora"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>

        <div className="site-header-actions">
          <Link className="button button-ghost" href="/login">
            Sign in
          </Link>

          <a
            className="button button-primary"
            href="https://app.aegisora.org"
            target="_blank"
            rel="noreferrer"
          >
            Open platform
            <ArrowUpRight size={14} />
          </a>

          <button
            className="button mobile-menu"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "12px 20px 18px",
            display: "grid",
            gap: 12,
          }}
        >
          <Link href="/how-it-works" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/proof" onClick={() => setOpen(false)}>
            Live proof
          </Link>
          <Link href="/evidence" onClick={() => setOpen(false)}>
            Evidence
          </Link>
          <Link href="/login" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        </div>
      ) : null}
    </header>
  );
}