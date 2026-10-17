"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { MEGA_MENUS, type MegaMenu } from "@/lib/mega-nav";

const navLink = "text-sm font-medium text-[#c7d4ee] transition-colors hover:text-white";

function Panel({ menu, onNavigate }: { menu: MegaMenu; onNavigate: () => void }) {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-[#1c3b7a] bg-[#0a1a40] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={"grid flex-1 gap-x-8 p-7 " + (menu.columns.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {menu.columns.map((col, ci) => (
            <div key={ci} className="space-y-6">
              {col.map((group, gi) => (
                <div key={gi}>
                  {group.heading ? (
                    <p className="mb-2 px-2 text-[11px] font-semibold tracking-[0.12em] text-[#8fa4cc]">{group.heading}</p>
                  ) : null}
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.title + item.href}>
                          <Link href={item.href} onClick={onNavigate} className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-white/5">
                            {Icon ? <Icon className="mt-0.5 size-5 shrink-0 text-[#00b1fd]" aria-hidden /> : null}
                            <span className="min-w-0">
                              <span className="block text-[15px] font-semibold text-white">{item.title}</span>
                              {item.desc ? <span className="mt-0.5 block text-sm leading-snug text-[#a9bbdb]">{item.desc}</span> : null}
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
          <div className="flex divide-x divide-[#1c3b7a] border-t border-[#1c3b7a]">
            {menu.footer.map((f) => (
              <Link key={f.href + f.title} href={f.href} onClick={onNavigate} className="flex-1 px-7 py-4 transition hover:bg-white/5">
                <span className="block text-sm font-semibold text-white">{f.title}</span>
                <span className="mt-0.5 block text-xs text-[#a9bbdb]">{f.desc}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {menu.rail && menu.rail.length > 0 ? (
        <div className="flex w-[250px] shrink-0 flex-col gap-1 bg-[#1c3b7a]/70 pl-1">
          {menu.rail.map((c) => (
            <div key={c.title} className="flex flex-1 flex-col justify-center bg-[#0a1a40] p-5">
              <p className="text-sm font-semibold text-white">{c.title}</p>
              <p className="mt-1 text-xs leading-snug text-[#a9bbdb]">{c.desc}</p>
              {c.style === "pill" ? (
                <Link href={c.href} onClick={onNavigate} className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-[#8fa4cc]/60 text-xs font-semibold text-white transition hover:bg-white/10">
                  {c.cta}
                </Link>
              ) : (
                <Link href={c.href} onClick={onNavigate} className="mt-3 inline-flex items-center justify-between text-xs font-semibold text-white hover:text-[#00b1fd]">
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
    const btn = triggers.current[id];
    const menu = MEGA_MENUS.find((m) => m.id === id);
    if (wrap && btn && menu) {
      const w = Math.min(menu.width, window.innerWidth - 32);
      const wr = wrap.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
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
      {/* ANNOUNCEMENT BAR */}
      <div className="border-b border-[#0f2a5c] bg-gradient-to-r from-[#00309c] to-[#0a5bd6] text-white">
        <div className="mx-auto flex min-h-12 max-w-[1280px] items-center justify-center gap-3 px-4 py-2 text-sm sm:px-6">
          <span className="hidden rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold sm:inline">Early access</span>
          <span>Create a test workspace and evaluate your first agent action.</span>
          <Link href="/signup" className="inline-flex shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline">
            Test Aegisora <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="sticky top-0 z-[100] w-full border-b border-[#0f2a5c] bg-[#000b24]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <div ref={wrapRef} onMouseLeave={hideSoon} onMouseEnter={keepOpen} className="relative hidden h-14 items-center lg:flex">
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
                <div className="absolute top-full z-50 pt-2" style={{ left, width: active.width, maxWidth: "calc(100vw - 2rem)" }}>
                  <Panel menu={active} onNavigate={() => setOpen(null)} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-5 lg:flex">
              <Link href="/login" className={navLink}>
                Log in
              </Link>
              <Link href="/signup" className="inline-flex h-9 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover">
                Test Aegisora
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-[#27457f] p-2 text-[#c7d4ee] transition-colors hover:bg-white/10 hover:text-white focus:outline-none lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#000b24] px-6 pb-10 pt-28 lg:hidden">
          <nav className="flex flex-col gap-2">
            {MEGA_MENUS.map((m) => (
              <details key={m.id} className="group border-b border-[#0f2a5c]">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-lg font-semibold text-[#e6eeff] [&::-webkit-details-marker]:hidden">
                  {m.label}
                  <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-3">
                  {m.columns.flat().map((g, gi) => (
                    <div key={gi} className="mb-3">
                      {g.heading ? <p className="px-2 text-[11px] font-semibold tracking-[0.12em] text-[#8fa4cc]">{g.heading}</p> : null}
                      <ul>
                        {g.items.map((i) => (
                          <li key={i.title + i.href}>
                            <Link href={i.href} className="block rounded-md px-2 py-2 text-base text-[#e6eeff] hover:bg-white/10">
                              {i.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {m.footer.map((f) => (
                    <Link key={f.href + f.title} href={f.href} className="block rounded-md px-2 py-2 text-base font-semibold text-[#00b1fd] hover:bg-white/10">
                      {f.title}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link href="/pricing" className="border-b border-[#0f2a5c] py-3 text-lg font-semibold text-[#e6eeff]">
              Pricing
            </Link>
            <Link href="/login" className="py-3 text-lg font-semibold text-[#e6eeff]">
              Log in
            </Link>
            <Link href="/signup" className="flex h-12 w-full items-center justify-center rounded bg-primary text-base font-medium text-primary-foreground hover:bg-primary-hover">
              Test Aegisora
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}