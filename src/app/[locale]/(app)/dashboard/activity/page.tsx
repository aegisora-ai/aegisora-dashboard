import type { Metadata } from "next";
import { Activity } from "lucide-react";

export const metadata: Metadata = { title: "Live Activity" };

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Live Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time execution requests and enforcement actions.</p>
      </header>
      <div className="aeg-panel flex h-[400px] flex-col items-center justify-center text-muted-foreground">
        <Activity className="mb-4 size-8 animate-pulse text-cyan/50" />
        <p className="text-sm">Listening to execution boundary...</p>
        <p className="mt-1 font-mono text-[10px] tracking-wider">AWAITING REQUESTS</p>
      </div>
    </div>
  );
}