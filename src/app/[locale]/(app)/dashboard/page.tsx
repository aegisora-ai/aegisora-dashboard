"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowRight, Bot, UserCheck, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/lib/aegisora/use-workspace";
import { useWorkspace } from "@/components/aegisora/workspace-provider";
import { Badge, WorkspaceGate, fmt } from "@/components/aegisora/live/ui";
import type { Row } from "@/components/aegisora/live/live-table";

type Counts = { agents: number | null; policies: number | null; pending: number | null; incidents: number | null; total: number | null; block: number | null; escalate: number | null };
type Bucket = { allow: number; escalate: number; block: number };
type Point = { created_at: string; decision: string | null };

const HOUR = 36e5;
const num = (v: number | null) => (v === null ? "-" : v.toLocaleString("en-US"));
const cnt = (r: { count: number | null; error: unknown }) => (r.error ? null : (r.count ?? 0));

function bucketize(points: Point[]): { buckets: Bucket[]; labels: string[] } {
  const now = Date.now();
  const buckets: Bucket[] = Array.from({ length: 24 }, () => ({ allow: 0, escalate: 0, block: 0 }));
  const labels = Array.from({ length: 24 }, (_, i) => String(new Date(now - (23 - i) * HOUR).getHours()).padStart(2, "0"));
  for (const p of points) {
    const idx = 23 - Math.floor((now - new Date(p.created_at).getTime()) / HOUR);
    if (idx < 0 || idx > 23) continue;
    if (p.decision === "ALLOW") buckets[idx].allow++;
    else if (p.decision === "ESCALATE") buckets[idx].escalate++;
    else if (p.decision === "BLOCK") buckets[idx].block++;
  }
  return { buckets, labels };
}

function timeLeft(iso: string) {
  const mins = Math.round((Date.parse(iso) - Date.now()) / 6e4);
  if (mins < 1) return "expires now";
  if (mins < 60) return mins + "m left";
  return Math.round(mins / 60) + "h left";
}

function Bars({ buckets, labels }: { buckets: Bucket[]; labels: string[] }) {
  const totals = buckets.map((b) => b.allow + b.escalate + b.block);
  const max = Math.max(1, ...totals);
  return (
    <>
      <div className="aegc-bars" role="img" aria-label="Decisions per hour, last 24 hours">
        {buckets.map((b, i) => {
          const t = totals[i];
          const h = t === 0 ? 1 : Math.max(6, (t / max) * 100);
          return (
            <div key={i} className="aegc-bar" title={labels[i] + ":00 \u00b7 " + t + (t === 1 ? " decision" : " decisions")}>
              <div className="aegc-bar__area">
                <div className="aegc-bar__col" style={{ height: h + "%", animationDelay: i * 20 + "ms" }}>
                  {t > 0 ? (
                    <>
                      <i style={{ flex: b.block, background: "var(--block)" }} />
                      <i style={{ flex: b.escalate, background: "var(--escalate)" }} />
                      <i style={{ flex: b.allow, background: "var(--allow)" }} />
                    </>
                  ) : null}
                </div>
              </div>
              <span>{i % 3 === 0 ? labels[i] : ""}</span>
            </div>
          );
        })}
      </div>
      <div className="aegc-legend">
        <span><i style={{ background: "var(--allow)" }} />Allow</span>
        <span><i style={{ background: "var(--escalate)" }} />Escalate</span>
        <span><i style={{ background: "var(--block)" }} />Block</span>
      </div>
    </>
  );
}

function Overview({ ws }: { ws: Workspace }) {
  const { userName, userEmail } = useWorkspace();
  const [c, setC] = useState<Counts | null>(null);
  const [series, setSeries] = useState<{ buckets: Bucket[]; labels: string[] } | null>(null);
  const [recent, setRecent] = useState<Row[]>([]);
  const [agents, setAgents] = useState<Row[]>([]);
  const [pend, setPend] = useState<Row[]>([]);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const sb = createClient();
      const now = new Date();
      const nowIso = now.toISOString();
      const since = new Date(now.getTime() - 24 * HOUR).toISOString();
      const w = ws.id;
      const [ag, po, pe, inc, tot, blk, esc, ser, rec, agl, pel] = await Promise.all([
        sb.from("agents").select("id", { count: "exact", head: true }).eq("workspace_id", w),
        sb.from("policies").select("id", { count: "exact", head: true }).eq("workspace_id", w),
        sb.from("approvals").select("id", { count: "exact", head: true }).eq("workspace_id", w).eq("status", "pending").gt("expires_at", nowIso),
        sb.from("incidents").select("id", { count: "exact", head: true }).eq("workspace_id", w).eq("status", "open"),
        sb.from("decisions").select("id", { count: "exact", head: true }).eq("workspace_id", w).gte("created_at", since),
        sb.from("decisions").select("id", { count: "exact", head: true }).eq("workspace_id", w).gte("created_at", since).eq("decision", "BLOCK"),
        sb.from("decisions").select("id", { count: "exact", head: true }).eq("workspace_id", w).gte("created_at", since).eq("decision", "ESCALATE"),
        sb.from("decisions").select("created_at,decision").eq("workspace_id", w).gte("created_at", since).order("created_at", { ascending: false }).limit(1000),
        sb.from("decisions").select("id,created_at,agent_name,action,resource,decision").eq("workspace_id", w).order("created_at", { ascending: false }).limit(8),
        sb.from("agents").select("id,name,framework").eq("workspace_id", w).order("name").limit(5),
        sb.from("approvals").select("id,agent_name,action,requested_at,expires_at").eq("workspace_id", w).eq("status", "pending").gt("expires_at", nowIso).order("requested_at", { ascending: false }).limit(4),
      ]);
      if (!alive) return;
      setC({ agents: cnt(ag), policies: cnt(po), pending: cnt(pe), incidents: cnt(inc), total: cnt(tot), block: cnt(blk), escalate: cnt(esc) });
      setSeries(bucketize((ser.data ?? []) as Point[]));
      setRecent((rec.data ?? []) as Row[]);
      setAgents((agl.data ?? []) as Row[]);
      setPend((pel.data ?? []) as Row[]);
    };
    void load();
    const t = window.setInterval(() => { void load(); }, 30000);
    return () => { alive = false; window.clearInterval(t); };
  }, [ws.id]);

  const name = userName || (userEmail ? userEmail.split("@")[0] : "there");
  const reco =
    c && c.agents === 0
      ? { text: "Connect your first agent to start evaluating actions.", href: "/dashboard/agents", cta: "Register agent" }
      : c && c.policies === 0
        ? { text: "Define a policy so your agents have rules to follow.", href: "/dashboard/policies", cta: "Create policy" }
        : null;
  const anyData = series ? series.buckets.some((b) => b.allow + b.escalate + b.block > 0) : false;

  return (
    <div>
      {reco && !hide ? (
        <div className="aegc-reco" role="note">
          <b>Recommended:</b>
          <span>{reco.text}</span>
          <span className="aegc-reco__sp" />
          <Link href={reco.href}>{reco.cta}<ArrowRight aria-hidden="true" /></Link>
          <button type="button" aria-label="Dismiss" onClick={() => setHide(true)}><X aria-hidden="true" /></button>
        </div>
      ) : null}

      <div className="aegc-hello">
        <div>
          <h1>Hello, {name}</h1>
          <p>{ws.name}</p>
        </div>
        <Link href="/dashboard/agents" className="aegc-btn aegc-btn--solid">Register agent</Link>
      </div>

      <div className="aegc-stats">
        <Link href="/dashboard/decisions" className="aegc-stat"><span className="aegc-stat__l">Decisions (24h)</span><span className="aegc-stat__v">{num(c?.total ?? null)}</span></Link>
        <Link href="/dashboard/decisions" className="aegc-stat"><span className="aegc-stat__l">Blocked (24h)</span><span className="aegc-stat__v">{num(c?.block ?? null)}</span></Link>
        <Link href="/dashboard/approvals" className="aegc-stat"><span className="aegc-stat__l">Pending approvals</span><span className={"aegc-stat__v" + ((c?.pending ?? 0) > 0 ? " aegc-stat__v--warn" : "")}>{num(c?.pending ?? null)}</span></Link>
        <Link href="/dashboard/agents" className="aegc-stat"><span className="aegc-stat__l">Agents</span><span className="aegc-stat__v">{num(c?.agents ?? null)}</span></Link>
      </div>

      <div className="aegc-grid">
        <section className="aegc-card">
          <div className="aegc-card__h">
            <h2>Decisions<small>per hour, last 24 hours</small></h2>
            <Link href="/dashboard/activity">Live activity</Link>
          </div>
          {series && anyData ? (
            <Bars buckets={series.buckets} labels={series.labels} />
          ) : (
            <div className="aegc-empty">
              <Activity aria-hidden="true" />
              <span>{series ? "No decisions in the last 24 hours." : "Loading..."}</span>
            </div>
          )}
        </section>

        <div className="aegc-stack">
          <section className="aegc-card">
            <div className="aegc-card__h">
              <h2>Agents</h2>
              <Link href="/dashboard/agents">Manage agents</Link>
            </div>
            {agents.length > 0 ? (
              <div className="aegc-list">
                {agents.map((a) => (
                  <Link key={String(a.id)} href={"/dashboard/agents/" + a.id} className="aegc-li">
                    <span className="aegc-li__ic"><Bot aria-hidden="true" /></span>
                    <span className="aegc-li__t"><b>{String(a.name)}</b><small>{a.framework ? String(a.framework) : "agent"}</small></span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="aegc-note">No agents yet. <Link href="/dashboard/agents">Register your first agent</Link>.</p>
            )}
          </section>

          <section className="aegc-card">
            <div className="aegc-card__h">
              <h2>Needs your attention</h2>
              <Link href="/dashboard/approvals">Open queue</Link>
            </div>
            {pend.length > 0 ? (
              <div className="aegc-list">
                {pend.map((p) => (
                  <Link key={String(p.id)} href={"/dashboard/approvals/" + p.id} className="aegc-li">
                    <span className="aegc-li__ic"><UserCheck aria-hidden="true" /></span>
                    <span className="aegc-li__t"><b className="aegc-mono">{String(p.action ?? "action")}</b><small>{String(p.agent_name ?? "agent")}</small></span>
                    <span className="aegc-li__r">{timeLeft(String(p.expires_at))}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="aegc-note">All clear. No action is waiting for a decision.</p>
            )}
            {c && c.incidents !== null && c.incidents > 0 ? (
              <p className="aegc-note"><Link href="/dashboard/incidents">{num(c.incidents)} open incidents</Link> to review.</p>
            ) : null}
          </section>
        </div>
      </div>

      <section className="aegc-card" style={{ marginTop: 14 }}>
        <div className="aegc-card__h">
          <h2>Recent decisions</h2>
          <Link href="/dashboard/decisions">View all</Link>
        </div>
        {recent.length > 0 ? (
          <div className="aegc-tablewrap">
            <div className="aegc-rows">
              <div className="aegc-row aegc-row--h"><span>Time</span><span>Agent</span><span>Action</span><span>Resource</span><span>Decision</span></div>
              {recent.map((r) => (
                <div key={String(r.id)} className="aegc-row">
                  <span className="aegc-dim">{fmt(r.created_at)}</span>
                  <span>{String(r.agent_name ?? "-")}</span>
                  <span className="aegc-mono">{String(r.action ?? "-")}</span>
                  <span className="aegc-dim">{r.resource ? String(r.resource) : "-"}</span>
                  <span><Badge value={r.decision} /></span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="aegc-note">No decisions yet. Send a test action from an agent and it will show up here.</p>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return <WorkspaceGate>{(ws) => <Overview key={ws.id} ws={ws} />}</WorkspaceGate>;
}