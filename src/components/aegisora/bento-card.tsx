import { cn } from "@/lib/utils";

const toneStyles = {
  allow: { border: "border-allow", text: "text-allow" },
  block: { border: "border-block", text: "text-block" },
  escalate: { border: "border-escalate", text: "text-escalate" },
} as const;

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
  const t = toneStyles[tone];
  return (
    <article className={cn("border-t-4 bg-surface-2 p-8", t.border, className)}>
      <h3 className={cn("text-2xl font-bold tracking-tight", t.text)}>{title}</h3>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}