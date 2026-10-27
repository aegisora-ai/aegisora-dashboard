import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const pillDark = "h-10 rounded-full bg-foreground px-5 text-background hover:bg-foreground/85";
export const pillLight = "h-10 rounded-full border-border bg-card px-5 text-foreground hover:bg-muted";

export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] border-x", className)}>{children}</div>;
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 font-mono text-xs font-medium tracking-[0.14em] uppercase",
        light ? "text-white/80" : "text-primary",
      )}
    >
      <span aria-hidden className="size-1.5 bg-current" />
      {children}
    </p>
  );
}

export function SectionHead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="grid gap-6 border-b px-5 py-14 md:grid-cols-2 md:items-end md:px-10 lg:py-20">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-4 text-4xl font-medium tracking-tight text-balance sm:text-5xl">{title}</h2>
      </div>
      {intro ? (
        <p className="max-w-md text-base leading-relaxed text-muted-foreground md:justify-self-end">{intro}</p>
      ) : null}
    </div>
  );
}