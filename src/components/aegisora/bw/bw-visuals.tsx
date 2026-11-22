import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Lock, Shield, ShieldCheck, Terminal, Wifi, BatteryFull } from "lucide-react";
import type { Sample, Verdict } from "./bw-data";
import { BwMark, Pill } from "./bw-ui";

/* ------------------------ feature mini visuals ----------------------- */

export function PolicyVisual() {
  const t = useTranslations("Vis");
  const rows: [string, Verdict][] = [
    ["crm.read_*", "ALLOW"],
    ["payments.* above limit", "ESCALATE"],
    ["db.drop_*", "BLOCK"],
  ];
  return (
    <div aria-hidden="true" className="bw-vis">
      <div className="bw-vis__stack">
        <div className="bw-mini bw-mini--ghost" />
        <div className="bw-mini">
          <p className="bw-mini__title">{t("policyRules")}</p>
          {rows.map(([rule, v]) => (
            <div key={rule} className="bw-mini__row">
              <code>{rule}</code>
              <Pill verdict={v} className="bw-pill--xs" />
            </div>
          ))}
          <p className="bw-mini__foot">{t("noMatch")}</p>
        </div>
      </div>
    </div>
  );
}

export function ApprovalVisual() {
  const t = useTranslations("Vis");
  return (
    <div aria-hidden="true" className="bw-vis">
      <div className="bw-vis__stack">
        <div className="bw-mini">
          <div className="bw-mini__head">
            <p className="bw-mini__title">{t("approvalQueue")}</p>
            <span className="bw-count">{t("waiting2")}</span>
          </div>
          <div className="bw-mini__row">
            <code>payments.transfer</code>
            <Pill verdict="ESCALATE" className="bw-pill--xs" />
          </div>
          <p className="bw-mini__meta">finance-agent, $48,000</p>
          <div className="bw-mini__btns">
            <span className="bw-mini__ok">{t("approve")}</span>
            <span className="bw-mini__no">{t("deny")}</span>
          </div>
        </div>
        <div className="bw-mini bw-mini--ghost bw-mini--low">
          <div className="bw-mini__row">
            <code>files.export</code>
            <Pill verdict="ESCALATE" className="bw-pill--xs" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EvidenceVisual() {
  const rows = [
    ["dec_0001", "9c41f2...e07a"],
    ["dec_0002", "b27d10...4f93"],
    ["dec_0003", "e15a8c...71d0"],
  ];
  return (
    <div aria-hidden="true" className="bw-vis">
      <div className="bw-vis__stack bw-vis__stack--chain">
        {rows.map(([id, hash], i) => (
          <div key={id} className={"bw-mini bw-mini--rec" + (i === 2 ? " bw-mini--ghost" : "")}>
            <code>{id}</code>
            <small>{hash}</small>
            {i < 2 ? <ArrowRight className="bw-chain-arrow" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- phones ------------------------------- */

export function Phone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden="true" className={"bw-phone" + (className ? " " + className : "")}>
      <div className="bw-phone__top">
        <span>9:41</span>
        <i className="bw-phone__island" />
        <span className="bw-phone__sys">
          <Wifi />
          <BatteryFull />
        </span>
      </div>
      <div className="bw-phone__screen">{children}</div>
    </div>
  );
}

export function PhoneRequest() {
  const t = useTranslations("Vis");
  return (
    <Phone>
      <div className="bw-bubble bw-bubble--agent">
        <span className="bw-bubble__av">
          <Terminal />
        </span>
        <div>
          <b>finance-agent</b>
          <p>{t("wants")} payments.transfer</p>
        </div>
      </div>
      <pre className="bw-phone__code">
        {"POST /api/v1/evaluate\n{ \"action\": \"payments.transfer\",\n  \"context\": { \"amount\": 48000 } }"}
      </pre>
      <div className="bw-think">
        <BwMark size={18} /> {t("waiting")}
      </div>
    </Phone>
  );
}

export function PhoneEvaluate() {
  const t = useTranslations("Vis");
  return (
    <Phone>
      <div className="bw-think bw-think--big">
        <BwMark size={20} /> {t("checking")}
      </div>
      <div className="bw-tags">
        <span>{t("policy")}: transfer-approval-limit</span>
        <span>{t("authority")}: {t("inScope")}</span>
        <span>
          {t("amount")}: <em>{t("aboveLimit")}</em>
        </span>
        <span>{t("risk")}: {t("payments")}</span>
      </div>
      <div className="bw-bubble bw-bubble--bot">
        <p>{t("matching")}</p>
        <BwMark size={16} />
      </div>
    </Phone>
  );
}

export function PhoneDecide() {
  const t = useTranslations("Vis");
  return (
    <Phone>
      <div className="bw-verdict-card">
        <div className="bw-verdict-card__top">
          <code>payments.transfer</code>
          <Pill verdict="ESCALATE" />
        </div>
        <p>{t("mustApprove")}</p>
        <div className="bw-mini__btns">
          <span className="bw-mini__ok">{t("approve")}</span>
          <span className="bw-mini__no">{t("deny")}</span>
        </div>
      </div>
      <p className="bw-phone__cap">{t("execWaits")}</p>
    </Phone>
  );
}

export function PhoneRecord() {
  const t = useTranslations("Vis");
  const rows: [string, Verdict, string, string][] = [
    ["dec_0001", "ALLOW", t("startOfLog"), "9c41f2...e07a"],
    ["dec_0002", "ESCALATE", "9c41f2...e07a", "b27d10...4f93"],
  ];
  return (
    <Phone>
      {rows.map(([id, v, prev, hash]) => (
        <div key={id} className="bw-rec">
          <div className="bw-rec__top">
            <code>{id}</code>
            <Pill verdict={v} className="bw-pill--xs" />
          </div>
          <dl>
            <dt>prev</dt>
            <dd>{prev}</dd>
            <dt>hash</dt>
            <dd>{hash}</dd>
          </dl>
        </div>
      ))}
      <p className="bw-phone__cap">{t("recordCap")}</p>
    </Phone>
  );
}

export function PhoneVerdict({ sample }: { sample: Sample }) {
  const t = useTranslations("Vis");
  const tr = useTranslations("HomeUi.hero.reasons");
  const icon =
    sample.verdict === "ALLOW" ? <Check /> : sample.verdict === "BLOCK" ? <Lock /> : <ShieldCheck />;
  return (
    <Phone>
      <div className="bw-bubble bw-bubble--agent">
        <span className="bw-bubble__av">
          <Terminal />
        </span>
        <div>
          <b>{sample.agent}</b>
          <p>{sample.action}</p>
        </div>
      </div>
      <div className={"bw-bigmark bw-bigmark--" + sample.verdict.toLowerCase()}>{icon}</div>
      <div className="bw-verdict-card">
        <div className="bw-verdict-card__top">
          <Pill verdict={sample.verdict} />
          <small>{sample.policy ?? t("noPolicy")}</small>
        </div>
        <p>{tr(sample.id === "drop-table" ? "dropTable" : sample.id === "read-ticket" ? "readTicket" : sample.id === "bank-export" ? "bankExport" : sample.id === "files-export" ? "filesExport" : sample.id === "transfer" ? "transfer" : "fallback")}</p>
      </div>
    </Phone>
  );
}

/* ------------------------ platform visuals -------------------------- */

export function ShieldArt() {
  return (
    <div aria-hidden="true" className="bw-art">
      <div className="bw-art__lines" />
      <div className="bw-shield">
        <svg viewBox="0 0 260 300" width="100%" height="100%">
          <defs>
            <linearGradient id="bwsh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f6f9" />
              <stop offset="1" stopColor="#dfe3ea" />
            </linearGradient>
          </defs>
          <path
            d="M130 8 22 48v94c0 74 46 124 108 150 62-26 108-76 108-150V48L130 8Z"
            fill="url(#bwsh)"
            stroke="#c9ccd2"
            strokeWidth="6"
          />
          <path d="M130 24 36 58v84c0 66 40 110 94 134 54-24 94-68 94-134V58L130 24Z" fill="none" stroke="#fff" strokeWidth="3" opacity=".9" />
        </svg>
        <span className="bw-shield__logo">
          <Shield />
        </span>
      </div>
      <div className="bw-avatars">
        <span style={{ background: "#e2f4eb", color: "#0f7b4f" }}>AL</span>
        <span style={{ background: "#fff1d6", color: "#9a6400" }}>ES</span>
        <span style={{ background: "#fde4e4", color: "#b42318" }}>BL</span>
        <span style={{ background: "#e7e6ff", color: "#3432ef" }}>EV</span>
      </div>
    </div>
  );
}

export function RulesArt() {
  const t = useTranslations("Vis");
  const rules: [string, Verdict][] = [
    ["crm.read_ticket", "ALLOW"],
    ["files.export", "ESCALATE"],
    ["payments.transfer", "ESCALATE"],
    ["db.drop_table", "BLOCK"],
    ["email.send", "ESCALATE"],
  ];
  return (
    <div aria-hidden="true" className="bw-art">
      <div className="bw-art__lines" />
      <div className="bw-cloud">
        <p className="bw-mini__title">{t("rulesPer")}</p>
        {rules.map(([r, v]) => (
          <div key={r} className="bw-mini__row">
            <code>{r}</code>
            <Pill verdict={v} className="bw-pill--xs" />
          </div>
        ))}
        <p className="bw-mini__foot">{t("noMatch")}</p>
      </div>
    </div>
  );
}

export function ChainArt() {
  const t = useTranslations("Vis");
  const rows: [string, Verdict, string][] = [
    ["dec_0001", "ALLOW", "9c41f2...e07a"],
    ["dec_0002", "ESCALATE", "b27d10...4f93"],
    ["dec_0003", "BLOCK", "e15a8c...71d0"],
  ];
  return (
    <div aria-hidden="true" className="bw-art">
      <div className="bw-art__lines" />
      <div className="bw-cloud bw-cloud--chain">
        <p className="bw-mini__title">{t("evidenceLog")}</p>
        {rows.map(([id, v, h], i) => (
          <div key={id} className="bw-chainrow">
            <div className="bw-mini__row">
              <code>{id}</code>
              <Pill verdict={v} className="bw-pill--xs" />
            </div>
            <small>{h}</small>
            {i < 2 ? <span className="bw-chainrow__link" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ charts ------------------------------ */

export function ProblemChart() {
  const t = useTranslations("Vis");
  return (
    <div aria-hidden="true" className="bw-chart bw-chart--bad">
      <span className="bw-tag bw-tag--bad">{t("problem")}</span>
      <svg viewBox="0 0 440 220" preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id="bwbad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2a3a8" stopOpacity=".75" />
            <stop offset="1" stopColor="#f2a3a8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 150 C30 120 44 190 78 150 S130 90 160 140 S216 190 246 128 S300 80 330 130 S400 176 440 120 L440 220 L0 220 Z"
          fill="url(#bwbad)"
        />
        <path
          d="M0 150 C30 120 44 190 78 150 S130 90 160 140 S216 190 246 128 S300 80 330 130 S400 176 440 120"
          fill="none"
          stroke="#e46c76"
          strokeWidth="2"
        />
      </svg>
      <div className="bw-chart__tip bw-chart__tip--a">
        <b>{t("grantedOnce")}</b>
        <em>{t("accessSet")}</em>
      </div>
      <div className="bw-chart__tip bw-chart__tip--b">
        <b>{t("loggedAfter")}</b>
        <em>{t("writtenOnce")}</em>
      </div>
    </div>
  );
}

export function SolutionChart() {
  const t = useTranslations("Vis");
  return (
    <div aria-hidden="true" className="bw-chart bw-chart--good">
      <span className="bw-tag bw-tag--good">{t("solution")}</span>
      <svg viewBox="0 0 440 220" preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id="bwgood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6f6cf6" stopOpacity=".7" />
            <stop offset="1" stopColor="#6f6cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 180 C60 176 90 160 130 150 S210 120 250 100 S350 60 440 30 L440 220 L0 220 Z" fill="url(#bwgood)" />
        <path d="M0 180 C60 176 90 160 130 150 S210 120 250 100 S350 60 440 30" fill="none" stroke="#3432ef" strokeWidth="2" />
      </svg>
      <div className="bw-chart__tip bw-chart__tip--c">
        <b>{t("perAction")}</b>
        <em>{t("threeVerdicts")}</em>
      </div>
      <div className="bw-chart__tip bw-chart__tip--d">
        <b>{t("chained")}</b>
        <em>{t("shaRecord")}</em>
      </div>
    </div>
  );
}

export function TrendVisual() {
  const t = useTranslations("Vis");
  return (
    <div aria-hidden="true" className="bw-vis bw-vis--chart">
      <div className="bw-mini bw-mini--chart">
        <p className="bw-mini__title">{t("trends")}</p>
        <svg viewBox="0 0 300 120" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bwtr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6f6cf6" stopOpacity=".65" />
              <stop offset="1" stopColor="#6f6cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 100 L20 92 L38 98 L56 84 L76 90 L96 70 L118 78 L140 58 L162 66 L184 44 L206 52 L228 30 L250 38 L272 16 L300 8 L300 120 L0 120 Z" fill="url(#bwtr)" />
          <path d="M0 100 L20 92 L38 98 L56 84 L76 90 L96 70 L118 78 L140 58 L162 66 L184 44 L206 52 L228 30 L250 38 L272 16 L300 8" fill="none" stroke="#3432ef" strokeWidth="1.6" />
        </svg>
        <div className="bw-chart__tip bw-chart__tip--e">
          <b>{t("illustrative")}</b>
          <em>{t("sample")}</em>
        </div>
      </div>
    </div>
  );
}

export function RoutingVisual() {
  return (
    <div aria-hidden="true" className="bw-vis bw-vis--dots">
      <div className="bw-dotmap" />
      <div className="bw-call bw-call--a">
        <Pill verdict="BLOCK" className="bw-pill--xs" /> db.drop_table
      </div>
      <div className="bw-call bw-call--b">
        <Pill verdict="ESCALATE" className="bw-pill--xs" /> payments.transfer
      </div>
      <div className="bw-call bw-call--c">
        <Pill verdict="ALLOW" className="bw-pill--xs" /> crm.read_ticket
      </div>
    </div>
  );
}

export function ScopeVisual() {
  const t = useTranslations("Vis");
  const rows: [string, boolean][] = [
    [t("readTickets"), true],
    [t("transfer"), false],
    [t("exportFiles"), false],
  ];
  return (
    <div aria-hidden="true" className="bw-vis">
      <div className="bw-vis__stack">
        <div className="bw-mini">
          <div className="bw-mini__head">
            <p className="bw-mini__title">support-agent</p>
            <span className="bw-count">{t("scope")}</span>
          </div>
          {rows.map(([label, on]) => (
            <div key={label} className="bw-mini__row">
              <span>{label}</span>
              <span className={"bw-switch" + (on ? " is-on" : "")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HookVisual() {
  const t = useTranslations("Vis");
  const rows: [string, boolean][] = [
    [t("hook1"), true],
    [t("hook2"), true],
    [t("hook3"), false],
  ];
  return (
    <div aria-hidden="true" className="bw-vis">
      <div className="bw-vis__stack">
        <div className="bw-mini">
          <div className="bw-mini__head">
            <p className="bw-mini__title">Webhooks</p>
            <span className="bw-count">{t("decisionsWord")}</span>
          </div>
          {rows.map(([label, on]) => (
            <div key={label} className="bw-mini__row">
              <span>{label}</span>
              <span className={"bw-switch" + (on ? " is-on" : "")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GrowthChart() {
  return (
    <div aria-hidden="true" className="bw-growth">
      <svg viewBox="0 0 700 340" preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id="bwgr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6f6cf6" stopOpacity=".35" />
            <stop offset="1" stopColor="#6f6cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 300 C120 292 200 270 300 220 S520 90 700 20 L700 340 L0 340 Z" fill="url(#bwgr)" />
        <path d="M0 300 C120 292 200 270 300 220 S520 90 700 20" fill="none" stroke="#c9c6f7" strokeWidth="2" />
      </svg>
      <span className="bw-dotline bw-dotline--1" />
      <span className="bw-dotline bw-dotline--2" />
      <span className="bw-dotline bw-dotline--3" />
      <span className="bw-dotline bw-dotline--4" />
      <span className="bw-gnode bw-gnode--1">
        <Pill verdict="ALLOW" className="bw-pill--xs" />
      </span>
      <span className="bw-gnode bw-gnode--2">
        <Pill verdict="ESCALATE" className="bw-pill--xs" />
      </span>
      <span className="bw-gnode bw-gnode--3">
        <Pill verdict="BLOCK" className="bw-pill--xs" />
      </span>
      <span className="bw-gnode bw-gnode--4">
        <Pill verdict="ALLOW" className="bw-pill--xs" />
      </span>
    </div>
  );
}