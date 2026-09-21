import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3" className="stroke-foreground" strokeWidth="1.6" />
        <path d="M5.5 12h4.2M14.3 12h4.2" className="stroke-foreground" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 5.5v13" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="text-[13px] font-semibold tracking-[0.22em]">AEGISORA</span>
    </span>
  );
}