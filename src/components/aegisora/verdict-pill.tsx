import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type VerdictName = "ALLOW" | "ESCALATE" | "BLOCK";

const TONE: Record<VerdictName, string> = {
  ALLOW: "border-allow/30 bg-allow-muted text-allow",
  ESCALATE: "border-escalate/30 bg-escalate-muted text-escalate",
  BLOCK: "border-block/30 bg-block-muted text-block",
};

export function VerdictPill({ verdict, className }: { verdict: VerdictName; className?: string }) {
  return (
    <Badge variant="outline" className={cn("h-6 gap-1.5 px-2.5 font-semibold tracking-wide", TONE[verdict], className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {verdict}
    </Badge>
  );
}