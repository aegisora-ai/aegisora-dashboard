"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WORKSPACE_STORAGE_KEY } from "@/components/aegisora/workspace-provider";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnOutline, btnPrimary } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/aegisora/logo";
import { OnboardingIntro, INTRO_KEY } from "@/components/aegisora/onboarding-intro";

const STEP_KEYS = ["s0", "s1", "s2", "s3", "s4"];
type PolicyDecision = "ALLOW" | "BLOCK" | "ESCALATE";

export function OnboardingFlow() {
  const t = useTranslations("Onboarding");
  const steps = STEP_KEYS.map((k) => t("steps." + k));
  const [step, setStep] = useState(0);
  const [introDone, setIntroDone] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setIntroDone(window.localStorage.getItem(INTRO_KEY) === "done"); } catch { setIntroDone(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const [workspace, setWorkspace] = useState("My workspace");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("finance-operator");
  const [actionPattern, setActionPattern] = useState("invoice.read");
  const [resourcePattern, setResourcePattern] = useState("invoice:sample-001");
  const [decision, setDecision] = useState<PolicyDecision>("ESCALATE");
  const [agentId, setAgentId] = useState<string | null>(null);
  const [policyId, setPolicyId] = useState<string | null>(null);
  const [aal, setAal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 1) return;
    let cancelled = false;
    void createClient().auth.mfa.getAuthenticatorAssuranceLevel().then(({ data, error: mfaError }) => {
      if (!cancelled) {
        setAal(mfaError ? null : data.currentLevel);
        if (mfaError) setError(t("err.mfa"));
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function checkMfa() {
    setBusy(true);
    setError(null);
    const { data, error: mfaError } = await createClient().auth.mfa.getAuthenticatorAssuranceLevel();
    setBusy(false);
    if (mfaError) { setError(t("err.mfa")); return; }
    setAal(data.currentLevel);
  }

  async function createWorkspace() {
    setBusy(true);
    setError(null);
    const { data, error: createError } = await createClient().rpc("create_workspace", {
      p_name: workspace.trim(),
    });
    setBusy(false);
    if (createError || typeof data !== "string") {
      setError(createError?.message ?? t("err.noId"));
      return;
    }
    setWorkspaceId(data);
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, data);
    setStep(1);
  }

  async function postWorkspaceMutation(path: string, body: Record<string, unknown>) {
    if (!workspaceId) { setError(t("err.needWs")); return null; }
    setBusy(true);
    setError(null);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session?.access_token) throw new Error(t("err.signIn"));
      const response = await fetch(path, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, ...body }),
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const message = result?.error?.message ?? t("err.failed");
        if (result?.error?.code === "mfa_required") setAal("aal1");
        throw new Error(message);
      }
      return result as Record<string, unknown>;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("err.failed"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function createAgent() {
    const result = await postWorkspaceMutation("/api/v1/workspace/agents", {
      operation: "create",
      agent: { name: agentName.trim(), framework: null, description: "Created during workspace onboarding", external_id: null },
    });
    if (typeof result?.id === "string") setAgentId(result.id);
  }

  async function createPolicy() {
    const result = await postWorkspaceMutation("/api/v1/workspace/policies", {
      name: `${agentName.trim()} onboarding rule`,
      agent_id: agentId,
      action_pattern: actionPattern.trim(),
      resource_pattern: resourcePattern.trim(),
      decision,
      priority: 100,
    });
    if (typeof result?.id === "string") setPolicyId(result.id);
  }

  if (introDone === null) return null;
  if (!introDone) return <OnboardingIntro onDone={() => setIntroDone(true)} />;

  const continueStep = () => {
    setError(null);
    if (step === 1 && aal !== "aal2") return;
    setStep((current) => Math.min(current + 1, STEP_KEYS.length - 1));
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12"><Logo className="mb-10" />
      <ol className="mb-10 grid grid-cols-5 gap-1">
        {steps.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined}>
            <div className={cn("h-0.5", index <= step ? "bg-primary" : "bg-surface-4")} />
            <div className={cn("mt-2 font-mono text-[10px] tracking-wider", index === step ? "text-foreground" : "text-muted-foreground")}>
              {String(index + 1).padStart(2, "0")}<span className="hidden sm:inline"> {label.toUpperCase()}</span>
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="step-title" className="py-2">
        {step === 0 && (
          <>
            <h1 id="step-title" className="text-3xl font-semibold tracking-tight">{t("s0.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("s0.desc")}</p>
            <div className="mt-6 space-y-1.5"><Label htmlFor="workspace">{t("s0.label")}</Label><Input id="workspace" value={workspace} maxLength={120} onChange={(event) => setWorkspace(event.target.value)} /></div>
            <button type="button" onClick={() => void createWorkspace()} disabled={busy || !workspace.trim()} className={`${btnPrimary} mt-5 disabled:opacity-50`}>{busy ? t("s0.busy") : t("s0.btn")}</button>
          </>
        )}

        {step === 1 && (
          <>
            <h1 id="step-title" className="text-3xl font-semibold tracking-tight">{t("s1.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("s1.desc")}</p>
            <p role="status" className="mt-4 font-mono text-xs">{t("s1.assurance")}: {aal?.toUpperCase() ?? t("s1.checking")}</p>
            {aal !== "aal2" && <Link className="mt-4 flex w-fit text-sm underline underline-offset-4" href="/dashboard/identity" target="_blank" rel="noreferrer">{t("s1.open")}</Link>}
            <button type="button" onClick={() => void checkMfa()} disabled={busy} className={`${btnOutline} mt-5 disabled:opacity-50`}>{busy ? t("s1.busy") : t("s1.btn")}</button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 id="step-title" className="text-3xl font-semibold tracking-tight">{t("s2.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("s2.desc")}</p>
            <div className="mt-6 space-y-1.5"><Label htmlFor="agent">{t("s2.label")}</Label><Input id="agent" value={agentName} maxLength={120} onChange={(event) => setAgentName(event.target.value)} disabled={Boolean(agentId)} /></div>
            {agentId ? <p className="mt-4 break-all font-mono text-xs text-allow">{t("s2.registered")} {agentId}</p> : <button type="button" onClick={() => void createAgent()} disabled={busy || !agentName.trim()} className={`${btnPrimary} mt-5 disabled:opacity-50`}>{busy ? t("s2.busy") : t("s2.btn")}</button>}
          </>
        )}

        {step === 3 && (
          <>
            <h1 id="step-title" className="text-3xl font-semibold tracking-tight">{t("s3.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("s3.desc")}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="action-pattern">{t("s3.action")}</Label><Input id="action-pattern" value={actionPattern} maxLength={200} onChange={(event) => setActionPattern(event.target.value)} disabled={Boolean(policyId)} /></div>
              <div className="space-y-1.5"><Label htmlFor="resource-pattern">{t("s3.resource")}</Label><Input id="resource-pattern" value={resourcePattern} maxLength={500} onChange={(event) => setResourcePattern(event.target.value)} disabled={Boolean(policyId)} /></div>
            </div>
            <fieldset className="mt-5 space-y-2"><legend className="mb-2 text-sm font-medium">{t("s3.outcome")}</legend>
              {(["ESCALATE", "BLOCK", "ALLOW"] as const).map((effect) => (
                <label key={effect} className="flex cursor-pointer items-start gap-3 rounded-sm border border-border p-3 text-sm">
                  <input type="radio" name="decision" value={effect} checked={decision === effect} disabled={Boolean(policyId)} onChange={() => setDecision(effect)} className="mt-1" />
                  <span><span className="font-mono text-xs font-semibold">{effect}</span><span className="block text-muted-foreground">{effect === "ESCALATE" ? t("s3.escalate") : effect === "BLOCK" ? t("s3.block") : t("s3.allow")}</span></span>
                </label>
              ))}
            </fieldset>
            {policyId ? <p className="mt-4 break-all font-mono text-xs text-allow">{t("s3.persisted")} {policyId}</p> : <button type="button" onClick={() => void createPolicy()} disabled={busy || !actionPattern.trim() || !resourcePattern.trim()} className={`${btnPrimary} mt-5 disabled:opacity-50`}>{busy ? t("s3.busy") : t("s3.btn")}</button>}
          </>
        )}

        {step === 4 && (
          <>
            <h1 id="step-title" className="text-3xl font-semibold tracking-tight">{t("s4.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("s4.desc")}</p>
            <dl className="mt-5 divide-y divide-border/60 border-y border-border">
              <div className="py-3"><dt className="text-xs text-muted-foreground">{t("s4.ws")}</dt><dd className="mt-1 break-all font-mono text-xs">{workspaceId}</dd></div>
              <div className="py-3"><dt className="text-xs text-muted-foreground">{t("s4.agent")}</dt><dd className="mt-1 break-all font-mono text-xs">{agentId}</dd></div>
              <div className="py-3"><dt className="text-xs text-muted-foreground">{t("s4.policy")}</dt><dd className="mt-1 break-all font-mono text-xs">{policyId} / {decision}</dd></div>
            </dl>
            <div className="mt-5 space-y-3 text-sm">
              <Link href="/dashboard/api-keys" className="block underline underline-offset-4">{t("s4.key")}</Link>
              <Link href="/docs" className="block underline underline-offset-4">{t("s4.quickstart")}</Link>
              <p className="text-xs leading-5 text-muted-foreground">{t.rich("s4.note", { code: (chunks) => <code>{chunks}</code> })}</p>
            </div>
          </>
        )}

        {error && <p role="alert" className="mt-5 rounded-sm border border-block/30 bg-block-muted px-3 py-2 text-xs text-block">{error}</p>}
      </section>

      <div className="mt-6 flex justify-between">
        {step < 4 ? (
          <>
            <button type="button" onClick={() => { setError(null); setStep((current) => Math.max(0, current - 1)); }} disabled={step === 0 || busy} className={`${btnOutline} disabled:opacity-40`}>{t("back")}</button>
            {step === 0 ? <span /> : <button type="button" onClick={continueStep} disabled={busy || (step === 1 && aal !== "aal2") || (step === 2 && !agentId) || (step === 3 && !policyId)} className={`${btnPrimary} disabled:opacity-40`}>{t("next")}</button>}
          </>
        ) : <Link href="/dashboard" className={btnPrimary}>{t("open")}</Link>}
      </div>
    </div>
  );
}