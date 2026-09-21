import { Bot, Boxes, FileSearch, LineChart, ShieldCheck, Workflow } from "lucide-react";

const agents: [string, React.ComponentType<{ className?: string }>][] = [
  ["finance-operator", LineChart],
  ["ops-assistant", Workflow],
  ["report-builder", FileSearch],
  ["deploy-agent", Boxes],
  ["support-bot", Bot],
  ["compliance-checker", ShieldCheck],
];

export function AgentStrip() {
  return (
    <section aria-label="Sample agent types" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-5 text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground md:text-left">
          WORKS WITH ANY AGENT THAT PROPOSES ACTIONS
        </p>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3 md:grid-cols-6">
          {agents.map(([name, Icon]) => (
            <li key={name} className="flex flex-col items-center gap-2 bg-surface-2 px-3 py-5 text-center">
              <Icon className="size-5 text-muted-foreground" />
              <span className="font-mono text-[11px] text-muted-foreground">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}