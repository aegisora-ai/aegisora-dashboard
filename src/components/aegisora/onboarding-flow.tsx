"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WORKSPACE_STORAGE_KEY } from "@/components/aegisora/workspace-provider";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnOutline, btnPrimary } from "@/lib/ui";
import { cn } from "@/lib/utils";

const steps = ["Workspace", "MFA", "Agent", "Policy", "Integrate"];
type PolicyDecision = "ALLOW" | "BLOCK" | "ESCALATE";

function slugify(name: string) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base || "workspace"}-${crypto.randomUUID().slice(0, 8)}`;
}

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
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
        if (mfaError) setError("Unable to verify the current MFA assurance level.");
      }
    });
    return () => { cancelled = true; };
  }, [step]);

  async function checkMfa() {
    setBusy(true);
    setError(null);
    const { data, error: mfaError } = await createClient().auth.mfa.getAuthenticatorAssuranceLevel();
    setBusy(false);
    if (mfaError) { setError("Unable to verify the current MFA assurance level."); return; }
    setAal(data.currentLevel);
  }

  async function createWorkspace() {
    setBusy(true);
    setError(null);
    const { data, error: createError } = await createClient().rpc("create_workspace", {
      workspace_name: workspace.trim(),
      workspace_slug: slugify(workspace),
    });
    setBusy(false);
    if (createError || typeof data !== "string") {
      setError(createError?.message ?? "Workspace creation did not return a workspace ID.");
      return;
    }
    setWorkspaceId(data);
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, data);
    setStep(1);
  }

  async function postWorkspaceMutation(path: string, body: Record<string, unknown>) {
    if (!workspaceId) { setError("Create a workspace before continuing."); return null; }
    setBusy(true);
    setError(null);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session?.access_token) throw new Error("Sign in again to continue onboarding.");
      const response = await fetch(path, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, ...body }),
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const message = result?.error?.message ?? "The workspace setup request failed.";
        if (result?.error?.code === "mfa_required") setAal("aal1");
        throw new Error(message);
      }
      return result as Record<string, unknown>;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The workspace setup request failed.");
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

  const continueStep = () => {
    setError(null);
    if (step === 1 && aal !== "aal2") return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <ol className="mb-10 grid grid-cols-5 gap-1">
        {steps.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined}>
            <div className={cn("h-0.5", index <= step ? "bg-cyan" : "bg-surface-4")} />
            <div className={cn("mt-2 font-mono text-[10px] tracking-wider", index === step ? "text-foreground" : "text-muted-foreground")}>
              {String(index + 1).padStart(2, "0")}<span className="hidden sm:inline"> {label.toUpperCase()}</span>
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="step-title" className="rounded-md border border-border bg-surface-2 p-6">
        {step === 0 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Create your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">This creates a real workspace and OWNER membership through the authenticated workspace-creation RPC.</p>
            <div className="mt-6 space-y-1.5"><Label htmlFor="workspace">Workspace name</Label><Input id="workspace" value={workspace} maxLength={120} onChange={(event) => setWorkspace(event.target.value)} /></div>
            <button type="button" onClick={() => void createWorkspace()} disabled={busy || !workspace.trim()} className={`${btnPrimary} mt-5 disabled:opacity-50`}>{busy ? "Creating…" : "Create workspace"}</button>
          </>
        )}

        {step === 1 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Secure workspace administration</h1>
            <p className="mt-2 text-sm text-muted-foreground">Agent and policy changes require a verified TOTP factor and an AAL2 session. This setup stops here until the session is stepped up.</p>
            <p role="status" className="mt-4 font-mono text-xs">CURRENT ASSURANCE: {aal?.toUpperCase() ?? "CHECKING"}</p>
            {aal !== "aal2" && <a className="mt-4 inline-flex text-sm underline underline-offset-4" href="/dashboard/identity" target="_blank" rel="noreferrer">Open Identity in a new tab to enroll and verify MFA</a>}
            <button type="button" onClick={() => void checkMfa()} disabled={busy} className={`${btnOutline} mt-5 disabled:opacity-50`}>{busy ? "Checking…" : "Check MFA again"}</button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Register a real agent</h1>
            <p className="mt-2 text-sm text-muted-foreground">The agent is persisted in this workspace through the authenticated, AAL2-protected API.</p>
            <div className="mt-6 space-y-1.5"><Label htmlFor="agent">Agent name</Label><Input id="agent" value={agentName} maxLength={120} onChange={(event) => setAgentName(event.target.value)} disabled={Boolean(agentId)} /></div>
            {agentId ? <p className="mt-4 break-all font-mono text-xs text-allow">Registered agent ID: {agentId}</p> : <button type="button" onClick={() => void createAgent()} disabled={busy || !agentName.trim()} className={`${btnPrimary} mt-5 disabled:opacity-50`}>{busy ? "Registering…" : "Register agent"}</button>}
          </>
        )}

        {step === 3 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Create a persisted policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">This rule applies only to the registered agent and the action/resource patterns below.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="action-pattern">Action pattern</Label><Input id="action-pattern" value={actionPattern} maxLength={200} onChange={(event) => setActionPattern(event.target.value)} disabled={Boolean(policyId)} /></div>
              <div className="space-y-1.5"><Label htmlFor="resource-pattern">Resource pattern</Label><Input id="resource-pattern" value={resourcePattern} maxLength={500} onChange={(event) => setResourcePattern(event.target.value)} disabled={Boolean(policyId)} /></div>
            </div>
            <fieldset className="mt-5 space-y-2"><legend className="mb-2 text-sm font-medium">Policy outcome</legend>
              {(["ESCALATE", "BLOCK", "ALLOW"] as const).map((effect) => (
                <label key={effect} className="flex cursor-pointer items-start gap-3 rounded-sm border border-border p-3 text-sm">
                  <input type="radio" name="decision" value={effect} checked={decision === effect} disabled={Boolean(policyId)} onChange={() => setDecision(effect)} className="mt-1" />
                  <span><span className="font-mono text-xs font-semibold">{effect}</span><span className="block text-muted-foreground">{effect === "ESCALATE" ? "Pause and require human review." : effect === "BLOCK" ? "Deny the matching action." : "Permit the matching action."}</span></span>
                </label>
              ))}
            </fieldset>
            {policyId ? <p className="mt-4 break-all font-mono text-xs text-allow">Persisted policy ID: {policyId}</p> : <button type="button" onClick={() => void createPolicy()} disabled={busy || !actionPattern.trim() || !resourcePattern.trim()} className={`${btnPrimary} mt-5 disabled:opacity-50`}>{busy ? "Saving…" : "Create policy"}</button>}
          </>
        )}

        {step === 4 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Connect your server-side integration</h1>
            <p className="mt-2 text-sm text-muted-foreground">The workspace, agent, and policy below were saved. Create an API key and keep it in your server-side secret manager; this browser flow does not simulate a decision or execution.</p>
            <dl className="mt-5 divide-y divide-border/60 border-y border-border">
              <div className="py-3"><dt className="text-xs text-muted-foreground">Workspace ID</dt><dd className="mt-1 break-all font-mono text-xs">{workspaceId}</dd></div>
              <div className="py-3"><dt className="text-xs text-muted-foreground">Agent ID</dt><dd className="mt-1 break-all font-mono text-xs">{agentId}</dd></div>
              <div className="py-3"><dt className="text-xs text-muted-foreground">Policy ID / outcome</dt><dd className="mt-1 break-all font-mono text-xs">{policyId} / {decision}</dd></div>
            </dl>
            <div className="mt-5 space-y-3 text-sm">
              <Link href="/dashboard/api-keys" className="block underline underline-offset-4">Create a workspace API key</Link>
              <Link href="/developers" className="block underline underline-offset-4">Open API quickstart</Link>
              <p className="text-xs leading-5 text-muted-foreground">Send evaluations from your backend to <code>POST /api/v1/evaluate</code>. Continue your customer-owned action only on ALLOW; stop on BLOCK; pause for human review on ESCALATE. Aegisora records the governance result and does not execute your external action.</p>
            </div>
          </>
        )}

        {error && <p role="alert" className="mt-5 rounded-sm border border-block/30 bg-block-muted px-3 py-2 text-xs text-block">{error}</p>}
      </section>

      <div className="mt-6 flex justify-between">
        {step < 4 ? (
          <>
            <button type="button" onClick={() => { setError(null); setStep((current) => Math.max(0, current - 1)); }} disabled={step === 0 || busy} className={`${btnOutline} disabled:opacity-40`}>Back</button>
            {step === 0 ? <span /> : <button type="button" onClick={continueStep} disabled={busy || (step === 1 && aal !== "aal2") || (step === 2 && !agentId) || (step === 3 && !policyId)} className={`${btnPrimary} disabled:opacity-40`}>Continue</button>}
          </>
        ) : <Link href="/dashboard" className={btnPrimary}>Open Aegisora Control</Link>}
      </div>
    </div>
  );
}
