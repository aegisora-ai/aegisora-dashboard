"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { VerdictPill, type VerdictName } from "@/components/aegisora/verdict-pill";

type Rec = {
  id: string; workspace_id: string; seq: number; decision_id: string; hash_version: number; created_at_utc: string;
  action: string; decision: string; trace_id: string; payload_text: string; prev_hash: string; hash: string;
};
type Item = {
  decisionId: string; traceId: string; agent: string; action: string; effect: VerdictName; reason: string;
  policyId: string | null; redacted: boolean; status: "final" | "pending" | "approved" | "rejected";
};
type Check = { total: number; broken: number; details: { seq: number; reason: string }[] };

const PRESETS = [
  { label: "Read a ticket", agent: "support-agent", action: "crm.read_ticket", risk: 10, amount: "" },
  { label: "Transfer $900", agent: "finance-agent", action: "payments.transfer", risk: 30, amount: "900" },
  { label: "Transfer $48,000", agent: "finance-agent", action: "payments.transfer", risk: 55, amount: "48000" },
  { label: "Drop a table", agent: "code-agent", action: "db.drop_table", risk: 80, amount: "" },
  { label: "Export bank details", agent: "ops-agent", action: "vendors.export_bank_details", risk: 40, amount: "" },
];

const short = (h: string) => h.slice(0, 10) + "..." + h.slice(-4);
const field = "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const btn = "rounded-lg border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function LiveDemo() {
  const t = useTranslations("Demo");
  const [agent, setAgent] = useState(PRESETS[2].agent);
  const [action, setAction] = useState(PRESETS[2].action);
  const [risk, setRisk] = useState(PRESETS[2].risk);
  const [amount, setAmount] = useState(PRESETS[2].amount);
  const [note, setNote] = useState("");
  const [chain, setChain] = useState<Rec[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [check, setCheck] = useState<Check | null>(null);
  const [backup, setBackup] = useState<Rec | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tip = chain.length ? chain[chain.length - 1] : null;
  const full = chain.length >= 36;
  const last = items.length ? items[items.length - 1] : null;
  const pending = items.filter((i) => i.status === "pending");

  async function send(body: object) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? t("reqFailed", { status: res.status }));
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("reqFailed2"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  function preset(p: (typeof PRESETS)[number]) {
    setAgent(p.agent); setAction(p.action); setRisk(p.risk); setAmount(p.amount);
  }

  async function evaluate() {
    const input: Record<string, unknown> = {};
    if (amount.trim() !== "" && Number.isFinite(Number(amount))) input.amount = Number(amount);
    if (note.trim() !== "") input.note = note;
    const data = await send({ op: "evaluate", agent, action, risk, input, seq: chain.length + 1, prevHash: tip?.hash ?? "GENESIS" });
    if (!data) return;
    const rec = data.record as Rec;
    setChain((c) => [...c, rec]);
    setItems((i) => [...i, {
      decisionId: rec.decision_id, traceId: rec.trace_id, agent, action: rec.action, effect: data.effect as VerdictName,
      reason: data.reason, policyId: data.policy_id, redacted: data.redacted, status: data.approval_required ? "pending" : "final",
    }]);
    setCheck(null);
  }

  async function resolve(it: Item, approve: boolean) {
    if (!tip) return;
    const data = await send({ op: "resolve", approve, decisionId: it.decisionId, traceId: it.traceId, action: it.action, seq: chain.length + 1, prevHash: tip.hash });
    if (!data) return;
    setChain((c) => [...c, data.record as Rec]);
    setItems((l) => l.map((x) => (x.decisionId === it.decisionId ? { ...x, status: approve ? "approved" : "rejected" } : x)));
    setCheck(null);
  }

  async function verify() {
    const data = await send({ op: "verify", chain });
    if (data) setCheck(data as Check);
  }

  function tamper() {
    if (!chain.length || backup) return;
    setBackup(chain[0]);
    setChain((c) => [{ ...c[0], decision: c[0].decision === "ALLOW" ? "BLOCK" : "ALLOW" }, ...c.slice(1)]);
    setCheck(null);
  }

  function restore() {
    if (!backup) return;
    setChain((c) => [backup, ...c.slice(1)]);
    setBackup(null);
    setCheck(null);
  }

  function reset() {
    setChain([]); setItems([]); setCheck(null); setBackup(null); setError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid content-start gap-4">
        <Card className="p-0">
          <CardContent className="grid gap-4 p-6">
            <h2 className="text-lg font-semibold text-foreground">{t("step1")}</h2>
            <div role="group" aria-label={t("examples")} className="flex flex-wrap gap-2">
              {PRESETS.map((p, pi) => (
                <button key={p.label} type="button" onClick={() => preset(p)} className={btn}>{t("preset" + pi)}</button>
              ))}
            </div>
            <label className="grid gap-1 text-sm text-muted-foreground">{t("agent")}
              <input className={field} value={agent} onChange={(e) => setAgent(e.target.value)} maxLength={120} />
            </label>
            <label className="grid gap-1 text-sm text-muted-foreground">{t("action")}
              <input className={field + " font-mono"} value={action} onChange={(e) => setAction(e.target.value)} maxLength={200} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-muted-foreground">{t("amount")}
                <input className={field} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </label>
              <label className="grid gap-1 text-sm text-muted-foreground">{t("risk")}: {risk}
                <input type="range" min={0} max={100} value={risk} onChange={(e) => setRisk(Number(e.target.value))} />
              </label>
            </div>
            <label className="grid gap-1 text-sm text-muted-foreground">{t("note")}
              <input className={field} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
            </label>
            <button type="button" onClick={evaluate} disabled={busy || full || Boolean(backup)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              {t("evaluate")}
            </button>
            {backup ? <p className="text-sm text-muted-foreground">{t("restoreFirst")}</p> : null}
            {full ? <p className="text-sm text-muted-foreground">{t("full")}</p> : null}
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
          {t("sandbox")}
        </p>
      </div>

      <div className="grid content-start gap-4" aria-live="polite">
        <Card className="p-0">
          <CardContent className="grid gap-3 p-6">
            <h2 className="text-lg font-semibold text-foreground">{t("step2")}</h2>
            {last ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <VerdictPill verdict={last.effect} />
                  <span className="font-mono text-xs break-all text-muted-foreground">{last.policyId ?? t("noPolicy")}</span>
                </div>
                <p className="text-sm text-foreground">{last.reason}</p>
                {last.redacted ? <p className="text-sm text-muted-foreground">{t("masked")}</p> : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("pick")}</p>
            )}
          </CardContent>
        </Card>

        {pending.length ? (
          <Card className="p-0">
            <CardContent className="grid gap-3 p-6">
              <h2 className="text-lg font-semibold text-foreground">{t("step3")}</h2>
              {pending.map((it) => (
                <div key={it.decisionId} className="grid gap-2 rounded-lg border p-3">
                  <span className="font-mono text-sm break-all text-foreground">{it.agent}: {it.action}</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={() => resolve(it, true)} className={btn}>{t("approve")}</button>
                    <button type="button" disabled={busy} onClick={() => resolve(it, false)} className={btn}>{t("reject")}</button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card className="p-0">
          <CardContent className="grid gap-3 p-6">
            <h2 className="text-lg font-semibold text-foreground">{t("step4")}</h2>
            {chain.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("chainEmpty")}</p>
            ) : (
              <ol className="grid gap-2">
                {chain.map((r, i) => (
                  <li key={r.seq} className={"grid gap-1 rounded-lg border p-3 text-sm " + (backup && i === 0 ? "border-destructive" : "")}>
                    <span className="text-foreground">#{r.seq} {r.decision} <span className="font-mono break-all">{r.action}</span>{backup && i === 0 ? t("edited") : ""}</span>
                    <span className="font-mono text-xs text-muted-foreground">hash {short(r.hash)} / prev {r.prev_hash === "GENESIS" ? "GENESIS" : short(r.prev_hash)}</span>
                  </li>
                ))}
              </ol>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={verify} disabled={busy || !chain.length} className={btn}>{t("verify")}</button>
              <button type="button" onClick={tamper} disabled={busy || !chain.length || Boolean(backup)} className={btn}>{t("edit")}</button>
              <button type="button" onClick={restore} disabled={busy || !backup} className={btn}>{t("restore")}</button>
              <button type="button" onClick={reset} disabled={busy || !chain.length} className={btn}>{t("reset")}</button>
            </div>
            {check ? (
              <p role="status" className="text-sm text-foreground">
                {check.broken === 0
                  ? t("verified", { total: check.total })
                  : t("broken", { list: check.details.map((d) => "#" + d.seq + " (" + d.reason + ")").join(", ") })}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}