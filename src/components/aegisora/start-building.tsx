"use client";

import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type Card = { title: string; body: string; cta: string; href: string };

const CARDS: Card[] = [
  {
    title: "Evaluate your first action",
    body: "Send one request to the evaluate endpoint and read the decision, the reason and the evidence hash.",
    cta: "Open the quickstart",
    href: "/developers/quickstart",
  },
  {
    title: "Node helper",
    body: "A dependency-free client that fails closed by default. Guard any function so it only runs on ALLOW.",
    cta: "See the Node example",
    href: "/developers/quickstart",
  },
  {
    title: "Verifiable evidence",
    body: "Every decision returns an evidence hash. See how records are chained and how to verify them.",
    cta: "Explore evidence",
    href: "/product/evidence",
  },
  {
    title: "Enterprise pilot",
    body: "Run a scoped pilot with your security team and your own policies.",
    cta: "Talk to us",
    href: "/enterprise",
  },
];

const cardLink = "inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:gap-2.5";

export function StartBuilding() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const stepSize = () => {
    const first = ref.current?.firstElementChild as HTMLElement | null | undefined;
    return first ? first.offsetWidth + 16 : 300;
  };
  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * stepSize(), behavior: "smooth" });
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setActive(Math.min(CARDS.length - 1, Math.max(0, Math.round(el.scrollLeft / stepSize()))));
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
      <div>
        <h2 className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl">Start building</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Everything you need to put a decision point in front of your agents, from a single API call to a scoped pilot.
        </p>
        <Link href="/developers" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:gap-2.5">
          Developer docs <ArrowRight className="size-4" />
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <button type="button" aria-label="Previous" onClick={() => go(-1)} className="grid size-10 place-items-center rounded-md border border-border text-foreground transition hover:border-primary hover:text-primary">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" aria-label="Next" onClick={() => go(1)} className="grid size-10 place-items-center rounded-md border border-border text-foreground transition hover:border-primary hover:text-primary">
            <ChevronRight className="size-5" />
          </button>
          <div className="ml-2 flex items-center gap-1.5" aria-hidden>
            {CARDS.map((c, i) => (
              <span key={c.title} className={"h-1.5 rounded-full transition-all " + (i === active ? "w-5 bg-primary" : "w-1.5 bg-border")} />
            ))}
          </div>
        </div>
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CARDS.map((c) => (
          <div key={c.title} className="flex min-h-[280px] w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-border bg-surface-1 p-6 sm:w-[300px]">
            <div>
              <h3 className="text-2xl font-medium tracking-tight text-foreground">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
            <Link href={c.href} className={cardLink}>
              {c.cta} <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}