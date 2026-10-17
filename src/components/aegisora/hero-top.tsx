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
    secondary: { label: "Quickstart", href: "/developers/quickstart" },
  },
  leader: {
    primary: { label: "Talk to Enterprise", href: "/enterprise" },
    secondary: { label: "Test Aegisora", href: "/signup" },
  },
} as const;

const linkCls = "mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-primary";

export function HeroTop() {
  const [audience, setAudience] = useState<Audience>("builder");
  const cta = CTA[audience];
  const tab = (a: Audience) =>
    "h-9 rounded-lg px-4 font-semibold transition " +
    (audience === a ? "bg-primary text-primary-foreground" : "text-[#dbe6ff] hover:bg-white/10");

  return (
    <div>
      <div className="text-center">
        <div
          role="group"
          aria-label="Select experience"
          className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#27457f] bg-[#0a1f4d] p-[5px] pl-4 text-sm text-[#dbe6ff]"
        >
          <span className="pr-1">Select Experience:</span>
          <button type="button" aria-pressed={audience === "builder"} onClick={() => setAudience("builder")} className={tab("builder")}>Builder</button>
          <button type="button" aria-pressed={audience === "leader"} onClick={() => setAudience("leader")} className={tab("leader")}>Security Leader</button>
        </div>

        <h1 className="aeg-display mx-auto mt-12 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">
          Secure what your AI agents are allowed to do.
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-7">
          <Link href={cta.primary.href} className="inline-flex h-12 items-center gap-2 rounded bg-primary px-8 text-base font-medium text-primary-foreground transition hover:bg-primary-hover">
            {cta.primary.label}
          </Link>
          <Link href={cta.secondary.href} className="inline-flex items-center gap-2 text-base font-semibold transition hover:text-primary">
            {cta.secondary.label} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-[3fr_2fr] md:grid-rows-2">
        <div className="aeg-tile relative flex min-h-[440px] flex-col justify-end overflow-hidden md:row-span-2 md:min-h-[520px]">
          <Image src="/home.png" alt="" fill priority sizes="(min-width: 768px) 60vw, 100vw" className="object-cover object-[50%_32%]" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[72%] opacity-90" style={{ maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)" }}><DecisionCanvas className="h-full w-full" /></div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#000f33] via-[#000f33]/55 to-transparent" />
          <div className="relative z-10 p-6 md:p-8">
            <p className="aeg-eyebrow flex items-center gap-2 text-xs">
              <span className="size-1.5 rounded-full bg-primary" /> Early access
            </p>
            <h2 className="aeg-display mt-3 text-4xl sm:text-5xl">Runtime security for AI agents</h2>
            <p className="aeg-body-text mt-3 max-w-xl text-base leading-relaxed">
              Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, risk and authorization before it reaches the real environment.
            </p>
            <Link href="/developers/quickstart" className={linkCls}>
              Evaluate your first action <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="aeg-tile flex min-h-[252px] flex-col justify-end p-6 md:p-8">
          <p className="aeg-eyebrow flex items-center gap-2 text-xs">
            <span className="size-1.5 rounded-full bg-allow" /> Three decisions
          </p>
          <h2 className="aeg-display mt-3 text-3xl sm:text-4xl">Allow. Block. Escalate.</h2>
          <p className="aeg-body-text mt-3 text-base leading-relaxed">
            Every request returns one of three decisions. Without a matching policy the workspace default applies, which is BLOCK.
          </p>
          <Link href="/developers/quickstart" className={linkCls}>
            Read the quickstart <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="aeg-tile flex min-h-[252px] flex-col justify-end p-6 md:p-8">
          <p className="aeg-eyebrow flex items-center gap-2 text-xs">
            <span className="size-1.5 rounded-full bg-cyan" /> Evidence
          </p>
          <h2 className="aeg-display mt-3 text-3xl sm:text-4xl">Verifiable by design</h2>
          <p className="aeg-body-text mt-3 text-base leading-relaxed">
            Every decision returns an evidence hash you can verify later, so you can show what was decided and why.
          </p>
          <Link href="/developers" className={linkCls}>
            Developer docs <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}