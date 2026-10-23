import { Logo } from "@/components/aegisora/logo";

const BG =
  "radial-gradient(ellipse 42% 55% at 6% 12%, #1599ff 0%, rgba(21,153,255,0) 70%), radial-gradient(ellipse 45% 55% at 92% 85%, #0f9bff 0%, rgba(15,155,255,0) 70%), radial-gradient(ellipse 60% 50% at 50% 40%, #001f7d 0%, rgba(0,31,125,0) 80%), #001a6e";

const POINTS = [
  { label: "ALLOW", cls: "border-allow/40 bg-allow/15 text-allow", text: "Actions that match your policies run without delay." },
  { label: "BLOCK", cls: "border-block/40 bg-block/15 text-block", text: "Actions that break a policy are stopped before they run." },
  { label: "ESCALATE", cls: "border-escalate/40 bg-escalate/15 text-escalate", text: "Sensitive actions wait for a human approval." },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background text-foreground">
      <div className="grid min-h-full lg:grid-cols-[minmax(440px,560px)_minmax(0,1fr)]">
        <main className="flex flex-col px-6 py-8 sm:px-12">
          <div className="w-fit"><Logo /></div>
          <div className="flex flex-1 items-center py-10">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </main>

        <aside className="relative hidden overflow-hidden border-l border-white/10 text-white lg:block" style={{ background: BG }}>
          <div className="relative z-10 flex min-h-full flex-col justify-center gap-10 p-14">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">Runtime control for AI agents</p>
              <h2 className="aeg-display mt-4 text-4xl xl:text-5xl">Every agent action, decided before it runs.</h2>
              <p className="mt-4 text-sm leading-6 text-white/80">
                Set policies, review approvals and keep an audit trail for every decision your agents make.
              </p>
            </div>
            <ul className="max-w-md space-y-3">
              {POINTS.map((p) => (
                <li key={p.label} className="flex items-center gap-4 rounded-xl border border-white/15 bg-[#001a6e]/60 p-4 backdrop-blur-sm">
                  <span className={"rounded border px-2 py-1 font-mono text-[11px] font-semibold tracking-wide " + p.cls}>{p.label}</span>
                  <span className="text-sm text-white/90">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}