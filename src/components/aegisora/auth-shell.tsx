import { Logo } from "@/components/aegisora/logo";
import { AuthCanvas } from "./auth-canvas";

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

        <aside className="aeg-night relative hidden overflow-hidden lg:block">
          <AuthCanvas />
          <div className="relative z-10 flex min-h-full flex-col justify-center gap-10 p-14 text-white">
            <div className="max-w-md">
              <p className="aeg-eyebrow text-xs text-[#a9bbdb]">RUNTIME CONTROL FOR AI AGENTS</p>
              <h2 className="aeg-display mt-4 text-4xl xl:text-5xl">Every agent action, decided before it runs.</h2>
              <p className="mt-4 text-sm leading-6 text-[#a9bbdb]">
                Set policies, review approvals and keep an audit trail for every decision your agents make.
              </p>
            </div>
            <ul className="max-w-md space-y-3">
              {POINTS.map((p) => (
                <li key={p.label} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#061022]/70 p-4 backdrop-blur-sm">
                  <span className={"rounded border px-2 py-1 font-mono text-[11px] font-semibold tracking-wide " + p.cls}>{p.label}</span>
                  <span className="text-sm text-[#d3def0]">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}