"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, Layers, ListChecks, Lock, Route, ShieldCheck, Workflow, X } from "lucide-react";
import { BwBtn } from "./bw-ui";
import {
  ChainArt,
  PhoneDecide,
  PhoneEvaluate,
  PhoneRecord,
  PhoneRequest,
  RulesArt,
  ShieldArt,
} from "./bw-visuals";

/* ---------------------- scroll effects (blur-in) --------------------- */

export function BwEffects() {
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    const els = Array.prototype.slice.call(document.querySelectorAll(".bw-rv")) as HTMLElement[];
    const pending: HTMLElement[] = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.92) {
        el.classList.add("bw-rv--pre");
        pending.push(el);
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            (en.target as HTMLElement).classList.add("bw-rv--in");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    for (const el of pending) io.observe(el);
    return () => io.disconnect();
  }, []);
  return null;
}

/* --------------------------- reveal text ----------------------------- */

export function RevealText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [p, setP] = useState(1);
  const words = text.split(" ");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.35;
      const v = (start - r.top) / (start - end + r.height * 0.6);
      setP(Math.max(0, Math.min(1, v)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <p ref={ref} className="bw-reveal">
      {words.map((w, i) => {
        const on = i / words.length < p;
        return (
          <span key={i} className={on ? "is-on" : ""}>
            {w}{" "}
          </span>
        );
      })}
    </p>
  );
}

/* ----------------------------- platform ------------------------------ */

const PLATFORM_COUNT = 3;

export function PlatformTabs() {
  const t = useTranslations("HomeUi.platform");
  const items = [
    { id: "policy", label: t("policy.label"), desc: t("policy.desc"), icon: Layers, art: "rules" },
    { id: "failclosed", label: t("failclosed.label"), desc: t("failclosed.desc"), icon: ShieldCheck, art: "shield" },
    { id: "evidence", label: t("evidence.label"), desc: t("evidence.desc"), icon: ListChecks, art: "chain" },
  ];
  const [i, setI] = useState(1);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuto(!reduce);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => setI((n) => (n + 1) % PLATFORM_COUNT), 6000);
    return () => clearTimeout(timer);
  }, [i, auto]);

  const art = items[i].art;

  return (
    <div className="bw-plat">
      <div className="bw-plat__left">
        <div className="bw-plat__intro bw-rv">
          <p className="bw-eyebrow">{t("eyebrow")}</p>
          <h2 className="bw-h2">{t("title")}</h2>
          <p className="bw-lead">{t("lead")}</p>
          <BwBtn href="/docs/quickstart" tone="dark">
            {t("cta")}
            <ChevronDown className="bw-rot" aria-hidden="true" />
          </BwBtn>
        </div>
        <ul className="bw-plat__list" role="tablist" aria-label={t("tabsAria")}>
          {items.map((it, n) => {
            const Ico = it.icon;
            const active = n === i;
            return (
              <li key={it.id} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={"bw-plat__tab" + (active ? " is-active" : "")}
                  onClick={() => setI(n)}
                >
                  <Ico aria-hidden="true" />
                  <span>
                    <b>{it.label}</b>
                    {active ? <em>{it.desc}</em> : null}
                  </span>
                  {active ? (
                    <i
                      key={"bar-" + String(i)}
                      className={"bw-plat__bar" + (auto ? " is-run" : "")}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="bw-plat__right" role="tabpanel">
        {art === "rules" ? <RulesArt /> : art === "shield" ? <ShieldArt /> : <ChainArt />}
      </div>
    </div>
  );
}

/* ---------------------------- how it works --------------------------- */

const FLOW_ICONS = [Workflow, Route, Lock, ListChecks];

export function HowTabs() {
  const t = useTranslations("HomeUi.how");
  const flow = [
    { id: "request", step: "01", label: t("s1.label"), title: t("s1.title"), body: t("s1.body") },
    { id: "evaluate", step: "02", label: t("s2.label"), title: t("s2.title"), body: t("s2.body") },
    { id: "decide", step: "03", label: t("s3.label"), title: t("s3.title"), body: t("s3.body") },
    { id: "record", step: "04", label: t("s4.label"), title: t("s4.title"), body: t("s4.body") },
  ];
  const [i, setI] = useState(0);
  const cur = flow[i];

  function onKey(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowRight") setI((n) => (n + 1) % flow.length);
    if (e.key === "ArrowLeft") setI((n) => (n + flow.length - 1) % flow.length);
  }

  return (
    <div className="bw-how">
      <div className="bw-how__tabs" role="tablist" aria-label={t("tabsAria")}>
        {flow.map((s, n) => {
          const Ico = FLOW_ICONS[n];
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={n === i}
              tabIndex={n === i ? 0 : -1}
              className={"bw-how__tab" + (n === i ? " is-active" : "")}
              onClick={() => setI(n)}
              onKeyDown={onKey}
            >
              <Ico aria-hidden="true" />
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="bw-how__body" role="tabpanel">
        <div className="bw-how__text">
          <p className="bw-step">{t("step")} {cur.step}</p>
          <h3>{cur.title}</h3>
          <p>{cur.body}</p>
          <BwBtn href="/docs/technical" tone="light">
            {t("cta")}
          </BwBtn>
        </div>
        <div className="bw-how__vis">
          {i === 0 ? <PhoneRequest /> : i === 1 ? <PhoneEvaluate /> : i === 2 ? <PhoneDecide /> : <PhoneRecord />}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- faq -------------------------------- */

export function FaqList() {
  const t = useTranslations("HomeUi.faq");
  const items = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
  ];
  const [open, setOpen] = useState(0);
  return (
    <div className="bw-faq">
      {items.map((f, n) => {
        const on = open === n;
        return (
          <div key={"faq-" + n} className={"bw-faq__item" + (on ? " is-open" : "")}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={"bw-faq-" + n}
                id={"bw-faq-h-" + n}
                onClick={() => setOpen(on ? -1 : n)}
              >
                <span>{f.q}</span>
                {on ? <X aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
              </button>
            </h3>
            <div id={"bw-faq-" + n} role="region" aria-labelledby={"bw-faq-h-" + n} className="bw-faq__panel">
              <div>
                <p>{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div className="bw-faq__bar">
        <span className="bw-avatars bw-avatars--sm" aria-hidden="true">
          <span style={{ background: "#e7e6ff", color: "#3432ef" }}>A</span>
          <span style={{ background: "#e2f4eb", color: "#0f7b4f" }}>E</span>
          <span style={{ background: "#fff1d6", color: "#9a6400" }}>G</span>
        </span>
        <p>{t("bar")}</p>
        <div>
          <BwBtn href="/pilot" tone="light" size="sm">
            {t("apply")}
          </BwBtn>
          <BwBtn href="/enterprise" tone="dark" size="sm">
            {t("contact")}
            <ArrowRight aria-hidden="true" />
          </BwBtn>
        </div>
      </div>
    </div>
  );
}
