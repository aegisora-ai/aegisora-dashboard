import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

const BG =
  "radial-gradient(ellipse 42% 55% at 6% 12%, #1599ff 0%, rgba(21,153,255,0) 70%), radial-gradient(ellipse 45% 55% at 92% 85%, #0f9bff 0%, rgba(15,155,255,0) 70%), radial-gradient(ellipse 60% 50% at 50% 40%, #001f7d 0%, rgba(0,31,125,0) 80%), #001a6e";

const ROWS = [
  { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW", c: "bg-emerald-100 text-emerald-700" },
  { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", v: "ESCALATE", c: "bg-amber-100 text-amber-700" },
  { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK", c: "bg-red-100 text-red-700" },
];

export function HeroBlue() {
  return (
    <section className="relative isolate overflow-hidden text-white" style={{ background: BG }}>
      <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-16 text-center sm:px-6 md:pb-28 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">
          Runtime security for AI agents
        </p>
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-7xl">
          Every agent action gets a decision before it runs.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          Aegisora sits at the execution boundary of your AI agents. It checks each sensitive action against policy, risk and authorization, then returns ALLOW, ESCALATE or BLOCK.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-white px-7 text-sm font-semibold text-[#0a2a7a] transition hover:bg-white/90 sm:w-auto"
          >
            Test Aegisora
          </Link>
          <Link
            href="/enterprise"
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-md border border-white/60 px-7 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Talk to Enterprise <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl text-left md:mt-20">
          <div className="overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl shadow-black/30">
            <div className="flex h-12 items-center justify-between border-b border-slate-200 px-5">
              <span className="text-xs font-medium text-slate-500">Runtime decisions</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500" /> Live
              </span>
            </div>
            <ul className="divide-y divide-slate-200">
              {ROWS.map((r) => (
                <li key={r.action} className="flex h-16 items-center justify-between gap-3 px-5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">{r.action}</p>
                    <p className="truncate text-xs text-slate-500">{r.meta}</p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-1 font-mono text-[11px] font-semibold ${r.c}`}>{r.v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="absolute -left-28 top-24 hidden w-56 rounded-xl bg-white p-4 text-slate-900 shadow-xl shadow-black/30 xl:block">
            <p className="text-xs font-semibold">Approval requested</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">A transfer above the limit waits for a human approver.</p>
          </div>
          <div className="absolute -right-28 bottom-6 hidden w-56 rounded-xl bg-white p-4 text-slate-900 shadow-xl shadow-black/30 xl:block">
            <p className="text-xs font-semibold">Evidence recorded</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Each decision is written to a SHA-256 hash-chained log.</p>
          </div>
        </div>
      </div>
    </section>
  );
}