import Link from "next/link";
import { Logo } from "@/components/aegisora/logo";
import { ThemeToggle } from "@/components/aegisora/theme-toggle";

const stages = ["REQUEST", "CONTEXT", "POLICY", "RISK", "DECISION", "ENFORCEMENT", "EXECUTION", "EVIDENCE"];

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="aeg-grid-bg hidden flex-col justify-between border-r border-border bg-surface-1 p-10 lg:flex">
        <Link href="/"><Logo /></Link>
        <div>
          <p className="max-w-sm text-3xl font-light leading-tight tracking-tight">
            An agent proposes. Aegisora decides.
          </p>
          <ol className="mt-8 space-y-1.5 font-mono text-[11px] tracking-wider text-muted-foreground">
            {stages.map((s, i) => (
              <li key={s}>
                <span className="mr-3">{String(i + 1).padStart(2, "0")}</span>
                <span className={s === "DECISION" ? "text-cyan" : ""}>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-muted-foreground">Runtime security for AI agents</p>
      </aside>
      <main className="relative flex items-center justify-center px-6 py-16">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        {children}
      </main>
    </div>
  );
}