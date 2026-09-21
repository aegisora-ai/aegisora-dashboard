import Link from "next/link";
import { AppSidebar } from "@/components/aegisora/app-sidebar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface-1 px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold tracking-[0.2em] lg:hidden">
              AEGISORA
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              workspace / <span className="text-foreground">demo-workspace</span>
            </span>
          </div>
          <nav aria-label="Quick links" className="flex gap-4 text-xs lg:hidden">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Overview
            </Link>
            <Link href="/dashboard/decisions" className="text-muted-foreground hover:text-foreground">
              Decisions
            </Link>
          </nav>
        </header>

        <div className="border-b border-escalate/30 bg-escalate-muted px-6 py-2 text-xs text-escalate">
          Sample data. This console is not yet connected to Aegisora Core.
        </div>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}