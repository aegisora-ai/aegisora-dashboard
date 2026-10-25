"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity, Bot, Check, ClipboardList, Ellipsis, FileCheck, GitBranch, KeyRound,
  LayoutDashboard, Scale, ScrollText, Settings, SlidersHorizontal, TriangleAlert,
  UserCheck, Users, CreditCard, ShieldCheck, Webhook, X,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Item = { id: string; href: string; label: string; icon: LucideIcon };
type Density = "compact" | "standard" | "large";
type Prefs = { tabs: string[]; density: Density; home: string };

const ITEMS: Item[] = [
  { id: "overview", href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "activity", href: "/dashboard/activity", label: "Live Activity", icon: Activity },
  { id: "agents", href: "/dashboard/agents", label: "Agents", icon: Bot },
  { id: "policies", href: "/dashboard/policies", label: "Policies", icon: ScrollText },
  { id: "decisions", href: "/dashboard/decisions", label: "Decisions", icon: Scale },
  { id: "approvals", href: "/dashboard/approvals", label: "Approvals", icon: UserCheck },
  { id: "incidents", href: "/dashboard/incidents", label: "Incidents", icon: TriangleAlert },
  { id: "evidence", href: "/dashboard/evidence", label: "Evidence", icon: FileCheck },
  { id: "audit", href: "/dashboard/audit", label: "Audit", icon: ClipboardList },
  { id: "traces", href: "/dashboard/traces", label: "Traces", icon: GitBranch },
  { id: "webhooks", href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { id: "api-keys", href: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
  { id: "settings", href: "/dashboard/settings", label: "Settings", icon: Settings },
  { id: "team", href: "/dashboard/team", label: "Team", icon: Users },
  { id: "billing", href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { id: "identity", href: "/dashboard/identity", label: "Identity", icon: ShieldCheck },
];

const GROUPS = [
  { title: "Overview", ids: ["overview"] },
  { title: "Runtime", ids: ["activity", "decisions", "approvals", "traces", "incidents"] },
  { title: "Governance", ids: ["agents", "policies", "evidence", "audit"] },
  { title: "Platform", ids: ["webhooks", "api-keys"] },
  { title: "Organization", ids: ["team", "billing", "identity", "settings"] },
];

const DEFAULTS: Prefs = {
  tabs: ["overview", "activity", "approvals", "incidents"],
  density: "standard",
  home: "overview",
};
const KEY = "aeg.dash.prefs.v1";
const byId = (id: string): Item | undefined => ITEMS.find((i) => i.id === id);
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

function sanitize(raw: unknown): Prefs {
  const r = (raw ?? {}) as Partial<Prefs>;
  const tabs = Array.isArray(r.tabs) ? r.tabs.filter((t) => typeof t === "string" && byId(t)) : [];
  return {
    tabs: tabs.length === 4 ? tabs : DEFAULTS.tabs,
    density: r.density === "compact" || r.density === "large" ? r.density : "standard",
    home: typeof r.home === "string" && byId(r.home) ? r.home : "overview",
  };
}

function tap() {
  try { navigator.vibrate?.(8); } catch { /* not supported */ }
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [sheet, setSheet] = useState<null | "more" | "customize">(null);
  const [counts, setCounts] = useState({ approvals: 0, incidents: 0 });
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);

  useEffect(() => {
    let p = DEFAULTS;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) p = sanitize(JSON.parse(raw));
    } catch { /* storage unavailable */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate prefs from localStorage after mount
    setPrefs(p);
    applyDensity(p.density);
    try {
      const atRoot = window.location.pathname.replace(/^\/[a-z]{2}(?=\/)/, "") === "/dashboard";
      if (atRoot && p.home !== "overview" && !sessionStorage.getItem("aeg.dash.home")) {
        sessionStorage.setItem("aeg.dash.home", "1");
        const it = byId(p.home);
        if (it && window.matchMedia("(max-width: 767px)").matches) router.replace(it.href);
      }
    } catch { /* storage unavailable */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (next: Prefs) => {
    setPrefs(next);
    applyDensity(next.density);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };

  const refresh = useCallback(async () => {
    try {
      const s = createClient();
      const [a, i] = await Promise.all([
        s.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
        s.from("incidents").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setCounts({ approvals: a.count ?? 0, incidents: i.count ?? 0 });
    } catch { /* badges stay as they are */ }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, state set after await
    refresh();
    const t = setInterval(refresh, 60000);
    const onVis = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [refresh, pathname]);

  const [sheetPath, setSheetPath] = useState(pathname);
  if (sheetPath !== pathname) { setSheetPath(pathname); setSheet(null); }

  useEffect(() => {
    if (!sheet) return undefined;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSheet(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [sheet]);

  const onTouchStart = (e: ReactTouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    drag.current = { y: t.clientY, dy: 0 };
  };
  const onTouchMove = (e: ReactTouchEvent) => {
    const d = drag.current;
    const el = sheetRef.current;
    const t = e.touches[0];
    if (!d || !el || !t) return;
    d.dy = Math.max(0, t.clientY - d.y);
    el.style.transition = "none";
    el.style.transform = `translate3d(0, ${d.dy}px, 0)`;
  };
  const onTouchEnd = () => {
    const d = drag.current;
    const el = sheetRef.current;
    drag.current = null;
    if (!d || !el) return;
    el.style.transition = "transform .2s ease-out";
    if (d.dy > 90) setSheet(null);
    else el.style.transform = "";
  };

  const isActive = (it: Item) => (it.id === "overview" ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/"));
  const badge = (id: string) => (id === "approvals" ? counts.approvals : id === "incidents" ? counts.incidents : 0);
  const tabIds = prefs.tabs.length === 4 ? prefs.tabs : DEFAULTS.tabs;
  const tabs = tabIds.map((id) => byId(id)).filter((x): x is Item => !!x);
  const moreActive = !tabs.some(isActive);

  const toggleTab = (id: string) => {
    tap();
    if (prefs.tabs.includes(id)) {
      if (prefs.tabs.length > 1) save({ ...prefs, tabs: prefs.tabs.filter((t) => t !== id) });
      return;
    }
    const next = prefs.tabs.length >= 4 ? [...prefs.tabs.slice(1), id] : [...prefs.tabs, id];
    save({ ...prefs, tabs: next });
  };
  const tabsOk = prefs.tabs.length === 4;

  return (
    <>
      <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {tabs.map((it) => {
            const Icon = it.icon;
            const n = badge(it.id);
            const active = isActive(it);
            return (
              <li key={it.id}>
                <Link
                  href={it.href}
                  onClick={tap}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                    FOCUS,
                    active ? "text-primary before:absolute before:inset-x-6 before:top-0 before:h-0.5 before:rounded-full before:bg-primary" : "text-muted-foreground",
                  )}
                >
                  <span className="relative">
                    <Icon className="size-5" />
                    {n > 0 && (
                      <span className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-escalate px-1 text-center text-[10px] font-semibold leading-4 text-black">{n > 99 ? "99+" : n}</span>
                    )}
                  </span>
                  <span className="max-w-full truncate px-1">{it.label.replace("Live ", "")}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => { tap(); setSheet("more"); }}
              aria-haspopup="dialog"
              aria-expanded={sheet !== null}
              className={cn("flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors", FOCUS, moreActive ? "text-primary" : "text-muted-foreground")}
            >
              <Ellipsis className="size-5" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {sheet && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={sheet === "more" ? "All sections" : "Customize"}>
          <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setSheet(null)} className="aeg-backdrop absolute inset-0 bg-black/60" />
          <div ref={sheetRef} className="aeg-sheet absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-2xl border-t border-border bg-surface-1 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className="sticky top-0 z-10 -mx-4 bg-surface-1 px-4 pb-2 pt-2">
              <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{sheet === "more" ? "All sections" : "Customize"}</h2>
                <button ref={closeRef} type="button" onClick={() => setSheet(null)} aria-label="Close" className={cn("flex size-10 items-center justify-center rounded-md hover:bg-surface-3", FOCUS)}><X className="size-5" /></button>
              </div>
            </div>

            {sheet === "more" ? (
              <div className="space-y-5 pt-2">
                {GROUPS.map((g) => (
                  <section key={g.title}>
                    <h3 className="mb-2 text-xs font-medium text-muted-foreground">{g.title}</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {g.ids.map((id) => byId(id)).filter((x): x is Item => !!x).map((it) => {
                        const Icon = it.icon;
                        const n = badge(it.id);
                        return (
                          <li key={it.id}>
                            <Link href={it.href} className={cn("flex min-h-12 items-center gap-2.5 rounded-lg border px-3 text-sm transition-colors active:bg-surface-3", FOCUS, isActive(it) ? "border-primary bg-primary/10 text-foreground" : "border-border bg-surface-2")}>
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">{it.label}</span>
                              {n > 0 && <span className="ml-auto rounded-full bg-escalate px-1.5 text-[10px] font-semibold text-black">{n}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
                <button type="button" onClick={() => setSheet("customize")} className={cn("flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-3", FOCUS)}>
                  <SlidersHorizontal className="size-4" /> Customize
                </button>
              </div>
            ) : (
              <div className="space-y-6 pt-2">
                <section>
                  <h3 className="text-sm font-semibold">Bottom tabs <span className={cn("ml-1 text-xs font-normal", tabsOk ? "text-muted-foreground" : "text-escalate")}>{prefs.tabs.length} of 4 selected</span></h3>
                  <p className="mt-1 text-xs text-muted-foreground">Choose four. Picking a fifth replaces the oldest. Everything else stays under More.</p>
                  <ul className="mt-3 grid grid-cols-2 gap-2">
                    {ITEMS.map((it) => {
                      const on = prefs.tabs.includes(it.id);
                      const Icon = it.icon;
                      return (
                        <li key={it.id}>
                          <button type="button" aria-pressed={on} onClick={() => toggleTab(it.id)} className={cn("flex min-h-12 w-full items-center gap-2.5 rounded-lg border px-3 text-left text-sm transition-colors", FOCUS, on ? "border-primary bg-primary/10" : "border-border bg-surface-2")}>
                            <Icon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{it.label}</span>
                            {on && <Check className="ml-auto size-4 text-primary" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-semibold">Text size</h3>
                  <div role="group" aria-label="Text size" className="mt-3 grid grid-cols-3 gap-2">
                    {(["compact", "standard", "large"] as Density[]).map((d) => (
                      <button key={d} type="button" aria-pressed={prefs.density === d} onClick={() => save({ ...prefs, density: d })} className={cn("min-h-12 rounded-lg border text-sm capitalize transition-colors", FOCUS, prefs.density === d ? "border-primary bg-primary/10" : "border-border bg-surface-2")}>{d}</button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold">Start page</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Where the app opens on this phone.</p>
                  <label className="sr-only" htmlFor="aeg-home">Start page</label>
                  <select id="aeg-home" value={prefs.home} onChange={(e) => save({ ...prefs, home: e.target.value })} className={cn("mt-3 min-h-12 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm", FOCUS)}>
                    {ITEMS.map((it) => <option key={it.id} value={it.id}>{it.label}</option>)}
                  </select>
                </section>

                <div className="flex gap-2">
                  <button type="button" onClick={() => save(DEFAULTS)} className={cn("min-h-12 flex-1 rounded-lg border border-border text-sm hover:bg-surface-3", FOCUS)}>Reset</button>
                  <button type="button" disabled={!tabsOk} onClick={() => setSheet("more")} className={cn("min-h-12 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50", FOCUS)}>Save changes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function applyDensity(d: string) {
  document.documentElement.dataset.density = d;
}
