"use client";

import { useState } from "react";
import Image from "next/image";
import { DecisionCanvas } from "@/components/aegisora/fx/decision-canvas";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

type Audience = "builder" | "leader";

const CTA = {
  builder: {
    primary: { label: "Test Aegisora", href: "/signup" },
    secondary: { label: "Apply for Enterprise Pilot", href: "/pilot" },
  },
  leader: {
    primary: { label: "Apply for Enterprise Pilot", href: "/pilot" },
    secondary: { label: "Test Aegisora", href: "/signup" },
  },
} as const;

const textLink = "mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:gap-2.5";

export function HeroTop() {
  const [audience, setAudience] = useState<Audience>("builder");
  const cta = CTA[audience];
  const tab = (a: Audience) =>
    "h-8 rounded px-3 text-sm font-medium transition " +
    (audience === a ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground");

  return (
    <div>
      <div className="text-center">
        <div role="group" aria-label="Select experience" className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-1 p-1">
          <button type="button" aria-pressed={audience === "builder"} onClick={() => setAudience("builder")} className={tab("builder")}>Builder</button>
          <button type="button" aria-pressed={audience === "leader"} onClick={() => setAudience("leader")} className={tab("leader")}>Security Leader</button>
        </div>

        <h1 className="mx-auto mt-10 max-w-4xl text-5xl font-medium leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl">
          Secure what your AI agents are allowed to do.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Aegisora evaluates every sensitive agent action against policy before it reaches your systems.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
          <Link href={cta.primary.href} className="inline-flex h-12 items-center rounded-md bg-primary px-7 text-base font-medium text-primary-foreground transition hover:bg-primary-hover">
            {cta.primary.label}
          </Link>
          <Link href={cta.secondary.href} className="inline-flex items-center gap-2 text-base font-medium text-foreground transition hover:text-primary">
            {cta.secondary.label} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-[#000f33] text-white md:col-span-2 md:min-h-[500px]">
          <Image src="/home.png" alt="" fill priority sizes="(min-width: 768px) 1200px, 100vw" className="object-cover object-[50%_32%]" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[72%] opacity-90" style={{ maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)" }}><DecisionCanvas className="h-full w-full" /></div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#000f33] via-[#000f33]/60 to-transparent" />
          <div className="relative z-10 p-6 md:p-10">
            <p className="text-sm font-medium text-[#8fb8ff]">Early access</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">Runtime security for AI agents</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#c7d4ee]">
              Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, risk and authorization before it reaches the real environment.
            </p>
            <Link href="/signup" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white transition hover:gap-2.5">
              Evaluate your first action <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="flex min-h-[240px] flex-col justify-end rounded-2xl border border-border bg-surface-1 p-6 md:p-8">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-allow" /> Three decisions
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">Allow. Block. Escalate.</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Every request returns one of three decisions. Without a matching policy the workspace default applies, which is BLOCK.
          </p>
          <Link href="/docs" className={textLink}>
            Read the docs <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="flex min-h-[240px] flex-col justify-end rounded-2xl border border-border bg-surface-1 p-6 md:p-8">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" /> Evidence
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">Verifiable by design</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Every decision returns an evidence hash you can verify later, so you can show what was decided and why.
          </p>
          <Link href="/docs/technical" className={textLink}>
            Developer docs <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}