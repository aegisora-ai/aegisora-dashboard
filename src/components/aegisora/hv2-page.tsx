"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import "@/styles/hv2.css";

type Draw = (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

function useCanvas(draw: Draw) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, vis = true, w = 0, h = 0;
    const fit = () => {
      const r = cv.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = w * d; cv.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; });
    const loop = (ms: number) => {
      if (vis) { ctx.clearRect(0, 0, w, h); draw(ctx, w, h, ms / 1000); }
      if (!still) raf = requestAnimationFrame(loop);
    };
    fit(); io.observe(cv);
    window.addEventListener("resize", fit);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", fit); };
  }, [draw]);
  return ref;
}

const ribbon: Draw = (c, w, h, t) => {
  const N = 120;
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(125,211,252,.7)");
  g.addColorStop(0.45, "rgba(29,107,255,.6)");
  g.addColorStop(1, "rgba(12,36,140,.7)");
  c.strokeStyle = g; c.lineWidth = 1.2;
  for (let i = 0; i < N; i++) {
    const k = (i / (N - 1)) * 2 - 1;
    c.beginPath();
    for (let j = 0; j <= 70; j++) {
      const u = j / 70;
      const cx = w * (0.68 + 0.13 * Math.sin(u * 2.2 + t * 0.3));
      const wd = w * 0.12 * (0.45 + 0.55 * Math.abs(Math.sin(u * 2.6 + t * 0.45 + 1)));
      const x = cx + k * wd * Math.cos(u * 4.2 + t * 0.55 + k * 0.9);
      const y = h * (u * 1.1 - 0.05);
      if (j) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(k * 3 + t * 0.5));
    c.stroke();
  }
  c.globalAlpha = 1;
};

const pins: Draw = (c, w, h, t) => {
  const N = 120, pad = w * 0.12;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const x = pad + u * (w - pad * 2);
    const y = h * 0.5 + Math.sin(u * 7 + t * 0.8) * h * 0.16 * (0.4 + u) + Math.cos(u * 3 - t * 0.4) * h * 0.06;
    const g = c.createLinearGradient(0, y, 0, h);
    g.addColorStop(0, "rgba(29,107,255,0.85)");
    g.addColorStop(1, "rgba(29,107,255,0)");
    c.strokeStyle = g; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, h); c.stroke();
    c.fillStyle = "#1d6bff";
    c.beginPath(); c.arc(x, y, 2, 0, 6.283); c.fill();
  }
};

const CARDS = [
  { t: "Policy as code", d: "Default BLOCK without a match. Rules stay readable, versioned and reviewable.", v: "code", wide: false },
  { t: "Human approvals", d: "ESCALATE sends high-risk actions to a person, bound to the exact request.", v: "approve", wide: false },
  { t: "Verifiable evidence", d: "A SHA-256 hash chain you can verify offline, without trusting us.", v: "chain", wide: false },
  { t: "Runtime decisions", d: "Every sensitive action is evaluated at the execution boundary through an 8-stage pipeline.", v: "table", wide: true },
  { t: "Isolation, roles and MFA", d: "Postgres row-level security per workspace, four roles, AAL2 step-up for governance changes.", v: "keys", wide: false },
];
const STATS = [["8", "pipeline stages per action"], ["3", "outcomes: ALLOW, BLOCK, ESCALATE"], ["SHA-256", "hash-chained evidence"], ["4", "roles with MFA step-up"]];
const ACTIONS = ["customers.delete", "deploy.rollback", "web.fetch", "crm.read_ticket", "email.send", "iam.grant_role", "payments.transfer", "db.drop_table"];
const ROWS = [["support-agent", "crm.read_ticket", "ALLOW"], ["billing-agent", "customers.delete", "BLOCK"], ["finance-agent", "payments.transfer", "ESCALATE"], ["research-agent", "web.fetch", "ALLOW"]];

function Vis({ k }: { k: string }) {
  if (k === "table") return (<div className="hv2-vis hv2-table">{ROWS.map(([a, b, c]) => (<div className="hv2-row" key={a}><span>{a}</span><code>{b}</code><b className={"hv2-tag " + c.toLowerCase()}>{c}</b></div>))}</div>);
  if (k === "code") return (<div className="hv2-vis hv2-code"><span>policy</span> finance-agent<br />&nbsp;&nbsp;allow <i>payments.transfer</i><br />&nbsp;&nbsp;when amount &lt; 5000<br />&nbsp;&nbsp;else <i>escalate</i></div>);
  if (k === "approve") return (<div className="hv2-vis hv2-appr"><code>payments.transfer $48,000</code><small>Above approval limit</small><div><u>Deny</u><u className="on">Approve</u></div></div>);
  if (k === "chain") return (<div className="hv2-vis hv2-chain">{["a91f", "3c7e", "e04b", "7d12"].map((x) => (<span key={x}>{x}</span>))}</div>);
  return (<div className="hv2-vis hv2-roles">{["workspace_a", "workspace_b", "Owner", "Admin", "Analyst"].map((x) => (<span key={x}>{x}</span>))}<em>MFA AAL2</em></div>);
}

function HomeV2(props: Record<string, unknown>) {
  void props;
  const rib = useCanvas(ribbon);
  const pin = useCanvas(pins);
  const [n, setN] = useState(1284903);
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1 + Math.floor(Math.random() * 8)), 700);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    const off = () => { if (el.classList.contains("dark")) el.classList.remove("dark"); };
    off();
    const mo = new MutationObserver(off);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return (
    <main className="hv2">
      <section className="hv2-hero">
        <canvas ref={rib} aria-hidden="true" />
        <div className="hv2-col hv2-hin">
          <p className="hv2-eye">Illustrative actions evaluated: <b>{n.toLocaleString("en-US")}</b></p>
          <h1>
            Your control layer for the agentic era.{" "}
            <span>Check every sensitive agent action against your policy before it runs – from the first call to the billionth.</span>
          </h1>
          <div className="hv2-btns">
            <Link href="/pilot" className="hv2-btn p">Request a pilot &rsaquo;</Link>
            <Link href="/docs" className="hv2-btn">Read the docs</Link>
          </div>
        </div>
      </section>

      <div className="hv2-col">
        <div className="hv2-strip">
          <small>Illustrative actions evaluated at the execution boundary</small>
          <div className="hv2-marq"><div>{[...ACTIONS, ...ACTIONS].map((a, i) => (<code key={i}>{a}</code>))}</div></div>
        </div>

        <section className="hv2-sec">
          <h2>Flexible controls for every agent. <span>Grow your agent fleet with policy, approvals and evidence, designed to work individually or together.</span></h2>
          <div className="hv2-grid">
            {CARDS.map((c) => (
              <article key={c.t} className={"hv2-card" + (c.wide ? " wide" : "")}>
                <Vis k={c.v} />
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hv2-sec hv2-center">
          <h2>The boundary between your agents and your systems</h2>
          <div className="hv2-stats">
            {STATS.map(([v, l]) => (<div key={v}><b>{v}</b><span>{l}</span></div>))}
          </div>
          <div className="hv2-wave"><canvas ref={pin} aria-hidden="true" /><small>Illustrative data</small></div>
        </section>

        <section className="hv2-cta">
          <h2>Put a control layer in front of your agents.</h2>
          <div className="hv2-btns c">
            <Link href="/pilot" className="hv2-btn p">Request a pilot &rsaquo;</Link>
            <Link href="/docs" className="hv2-btn">Read the docs</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomeV2;