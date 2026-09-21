import { cn } from "@/lib/utils";

function MockGate({ tone }: { tone: "allow" | "block" | "escalate" }) {
  const colorVar = tone === "allow" ? "var(--allow)" : tone === "block" ? "var(--block)" : "var(--escalate)";
  return (
    <svg viewBox="0 0 260 120" className="h-full w-full" aria-hidden="true">
      <rect x="1" y="1" width="258" height="118" rx="8" fill="var(--surface-3)" stroke="var(--border)" />
      <rect x="16" y="20" width="90" height="10" rx="2" fill="var(--surface-4)" />
      <rect x="16" y="38" width="140" height="8" rx="2" fill="var(--surface-4)" />
      <rect x="16" y="70" width="70" height="24" rx="4" fill={colorVar} opacity="0.16" />
      <rect x="16" y="70" width="70" height="24" rx="4" fill="none" stroke={colorVar} strokeWidth="1.5" />
      <circle cx="230" cy="30" r="14" fill="none" stroke={colorVar} strokeWidth="2" />
      <path d="M224 30h12M230 24v12" stroke={colorVar} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BentoCard({
  title,
  body,
  tone,
  className,
}: {
  title: string;
  body: string;
  tone: "allow" | "block" | "escalate";
  className?: string;
}) {
  return (
    <article className={cn("aeg-panel overflow-hidden", className)}>
      <div className="aspect-[13/6] border-b border-border bg-surface-2 p-3">
        <MockGate tone={tone} />
      </div>
      <div className="p-5">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}