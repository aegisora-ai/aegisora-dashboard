"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { MEGA_MENUS, type MegaMenu } from "@/lib/mega-nav";
import { SOCIALS } from "@/lib/socials";

// Bos birakirsan GitHub dugmesi gorunmez. Repo adresini yazinca otomatik cikar.
const GITHUB_URL = SOCIALS.find((s) => s.label === "GitHub")?.href ?? "";

const navLink = "text-sm font-medium text-white/70 transition-colors hover:text-white";
const btn = "inline-flex items-center justify-center rounded-md bg-white font-medium text-[#0a2a7a] transition hover:bg-white/90";

function Panel({ menu, onNavigate }: { menu: MegaMenu; onNavigate: () => void }) {
  return (
    <div className="dark flex overflow-hidden rounded-xl border border-white/10 bg-[#031249] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={"grid flex-1 gap-x-8 p-6 " + (menu.columns.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {menu.columns.map((col, ci) => (
            <div key={ci} className="space-y-6">
              {col.map((group, gi) => (
                <div key={gi}>
                  {group.heading ? (
                    <p className="mb-2 px-2 text-xs font-medium text-white/50">{group.heading}</p>
                  ) : null}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.title + item.href}>
                          <Link href={item.href} onClick={onNavigate} className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-white/5">
                            {Icon ? <Icon className="mt-0.5 size-5 shrink-0 text-sky-300" aria-hidden /> : null}
                            <span className="min-w-0">
                              <span className="block text-[15px] font-medium text-white">{item.title}</span>
                              {item.desc ? <span className="mt-0.5 block text-sm leading-snug text-white/60">{item.desc}</span> : null}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        {menu.footer.length > 0 ? (
          <div className="flex divide-x divide-white/10 border-t border-white/10 bg-white/[0.03]">
            {menu.footer.map((f) => (
              <Link key={f.href + f.title} href={f.href} onClick={onNavigate} className="flex-1 px-6 py-4 transition hover:bg-white/5">
                <span className="block text-sm font-medium text-white">{f.title}</span>
                <span className="mt-0.5 block text-xs text-white/60">{f.desc}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {menu.rail && menu.rail.length > 0 ? (
        <div className="flex w-[250px] shrink-0 flex-col divide-y divide-white/10 border-l border-white/10 bg-white/[0.03]">
          {menu.rail.map((c) => (
            <div key={c.title} className="flex flex-1 flex-col justify-center p-5">
              <p className="text-sm font-medium text-white">{c.title}</p>
              <p className="mt-1 text-xs leading-snug text-white/60">{c.desc}</p>
              {c.style === "pill" ? (
                <Link href={c.href} onClick={onNavigate} className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-white/25 text-xs font-medium text-white transition hover:border-sky-300 hover:text-sky-300">
                  {c.cta}
                </Link>
              ) : (
                <Link href={c.href} onClick={onNavigate} className="mt-3 inline-flex items-center justify-between text-xs font-medium text-sky-300 underline-offset-4 hover:underline">
                  {c.cta} <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [left, setLeft] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const timer = useRef<number | undefined>(undefined);

  // Route change intentionally closes every menu.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setMobileOpen(false);
      setOpen(null);
    }, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const show = useCallback((id: string) => {
    window.clearTimeout(timer.current);
    const wrap = wrapRef.current;
    const b = triggers.current[id];
    const menu = MEGA_MENUS.find((m) => m.id === id);
    if (wrap && b && menu) {
      const w = Math.min(menu.width, window.innerWidth - 32);
      const wr = wrap.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const vx = Math.max(16, Math.min(br.left - 24, window.innerWidth - w - 16));
      setLeft(vx - wr.left);
    }
    setOpen(id);
  }, []);

  const hideSoon = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(null), 140);
  };
  const keepOpen = () => window.clearTimeout(timer.current);
  const active = MEGA_MENUS.find((m) => m.id === open);

  return (
    <>
      <div className="dark border-b border-white/10 bg-[#031249] text-white">
        <div className="mx-auto flex min-h-10 max-w-[1280px] items-center justify-center gap-3 px-4 py-2 text-sm sm:px-6">
          <span className="hidden rounded border border-white/20 bg-white/5 px-2 py-0.5 text-xs font-medium text-white/80 sm:inline">Early access</span>
          <span className="text-white/70">Create a test workspace and evaluate your first agent action.</span>
          <Link href="/signup" className="inline-flex shrink-0 items-center gap-1 font-medium text-sky-300 underline-offset-4 hover:underline">
            Test Aegisora <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <header className="dark sticky top-0 z-[100] w-full border-b border-white/10 bg-[#020b2e]/85 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <div ref={wrapRef} onMouseLeave={hideSoon} onMouseEnter={keepOpen} className="relative hidden h-16 items-center lg:flex">
              <nav aria-label="Main" className="flex items-center gap-1">
                {MEGA_MENUS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    ref={(el) => {
                      triggers.current[m.id] = el;
                    }}
                    aria-expanded={open === m.id}
                    aria-haspopup="true"
                    onMouseEnter={() => show(m.id)}
                    onClick={() => (open === m.id ? setOpen(null) : show(m.id))}
                    className={"flex items-center gap-1 rounded-md px-3 py-1.5 " + navLink + (open === m.id ? " bg-white/10 text-white" : "")}
                  >
                    {m.label}
                    <ChevronDown size={14} className={"transition-transform duration-200 " + (open === m.id ? "rotate-180" : "")} />
                  </button>
                ))}
                <Link href="/pricing" onMouseEnter={() => setOpen(null)} className={"rounded-md px-3 py-1.5 " + navLink}>
                  Pricing
                </Link>
              </nav>
              {active ? (
                <div className="absolute top-full z-50 pt-1" style={{ left, width: active.width, maxWidth: "calc(100vw - 2rem)" }}>
                  <Panel menu={active} onNavigate={() => setOpen(null)} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-5 lg:flex">
              {GITHUB_URL ? (
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md border border-white/25 px-3 text-sm font-medium text-white transition hover:bg-white/10">
                  GitHub
                </a>
              ) : null}
              <Link href="/login" className={navLink}>Log in</Link>
              <Link href="/signup" className={btn + " h-9 px-4 text-sm"}>Test Aegisora</Link>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-white/25 p-2 text-white transition-colors hover:bg-white/10 focus:outline-none lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="dark fixed inset-0 z-[90] overflow-y-auto bg-[#020b2e] px-6 pb-10 pt-28 text-white lg:hidden">
          <nav className="flex flex-col gap-1">
            {MEGA_MENUS.map((m) => (
              <details key={m.id} className="group border-b border-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-lg font-medium text-white [&::-webkit-details-marker]:hidden">
                  {m.label}
                  <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-3">
                  {m.columns.flat().map((g, gi) => (
                    <div key={gi} className="mb-3">
                      {g.heading ? <p className="px-2 text-xs font-medium text-white/50">{g.heading}</p> : null}
                      <ul>
                        {g.items.map((i) => (
                          <li key={i.title + i.href}>
                            <Link href={i.href} className="block rounded-md px-2 py-2 text-base text-white hover:bg-white/5">
                              {i.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {m.footer.map((f) => (
                    <Link key={f.href + f.title} href={f.href} className="block rounded-md px-2 py-2 text-base font-medium text-sky-300 hover:bg-white/5">
                      {f.title}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link href="/pricing" className="border-b border-white/10 py-3 text-lg font-medium text-white">Pricing</Link>
            <Link href="/login" className="py-3 text-lg font-medium text-white">Log in</Link>
            <Link href="/signup" className={btn + " h-12 w-full text-base"}>Test Aegisora</Link>
          </nav>
        </div>
      )}
    </>
  );
}