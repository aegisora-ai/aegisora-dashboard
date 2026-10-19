import { conditionsMet } from "@/lib/aegisora/policy-evaluator";
import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { ApiError, admin, authenticate, deliverWebhooks, fail, matches, readJson, str } from "@/lib/aegisora/server";
import { maskSensitiveData, maskSensitiveText } from "@/lib/aegisora/redaction";
import { decidePolicy, type Effect } from "@/lib/aegisora/policy-evaluator";
import { evaluateWorkspaceExecutionEntitlement } from "@/lib/aegisora/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const t0 = Date.now();
    const auth = await authenticate(req);
    const body = await readJson(req);

    const agentName = str(body.agent, "agent", 120)!.trim();
    const action = str(body.action, "action", 200)!.trim();
    const resource = str(body.resource, "resource", 500, false) ?? "";
    if (body.risk !== undefined && body.risk !== null && (typeof body.risk !== "number" || !Number.isFinite(body.risk) || body.risk < 0 || body.risk > 100)) throw new ApiError(400, "invalid_request", "'risk' must be a number between 0 and 100.");
    const risk = typeof body.risk === "number" ? Math.round(body.risk) : 0;
    const input = body.input && typeof body.input === "object" ? body.input : null;
    const trace = (body.trace && typeof body.trace === "object" ? body.trace : {}) as Record<string, unknown>;
    const safeAgentName = maskSensitiveText(agentName);
    const safeAction = maskSensitiveText(action);
    const safeResource = maskSensitiveText(resource);
    const safeInput = maskSensitiveData(input);
    const safeTrace = maskSensitiveData(trace) as Record<string, unknown>;
    if (!agentName || !action) throw new ApiError(400, "invalid_request", "'agent' and 'action' must not be empty.");
    if (maskSensitiveText(agentName) !== agentName) {
      throw new ApiError(400, "invalid_request", "'agent' must be a non-sensitive identifier, not personal data or a credential.");
    }

    const db = admin();
    const ws = auth.workspaceId;

    const { data: s } = await db.from("workspace_settings").select("*").eq("workspace_id", ws).maybeSingle();
    const settings = {
      default_effect: (s?.default_effect ?? "BLOCK") as Effect,
      auto_register: s?.auto_register_agents ?? true,
      expiry_hours: (s?.approval_expiry_hours ?? 24) as number,
      alert_on_block: s?.alert_on_block ?? true,
    };

    // ---- agent (auto-discovery) ----
    let { data: agent } = await db.from("agents").select("id,state").eq("workspace_id", ws).eq("name", agentName).maybeSingle();
    let registered = false;
    if (!agent && settings.auto_register) {
      const ins = await db.from("agents").insert({ workspace_id: ws, name: agentName, source: "auto" }).select("id,state").single();
      if (ins.error) {
        const again = await db.from("agents").select("id,state").eq("workspace_id", ws).eq("name", agentName).maybeSingle();
        agent = again.data;
      } else {
        agent = ins.data;
        registered = true;
      }
    }

    // ---- policy evaluation: BLOCK > ESCALATE > ALLOW > workspace default ----
    const { data: pols } = await db
      .from("policies")
      .select("id,name,decision,priority,action_pattern,resource_pattern,agent_id,conditions")
      .eq("workspace_id", ws)
      .eq("enabled", true)
      .order("priority", { ascending: true });
    const hits = (pols ?? []).filter(
      (p) => (!p.agent_id || (agent && p.agent_id === agent.id)) && matches(p.action_pattern, action) && matches(p.resource_pattern, resource) && conditionsMet(p.conditions, { risk, input }, p.decision as Effect),
    );

    const decision = decidePolicy({
      agentFound: Boolean(agent),
      agentState: agent?.state ?? null,
      defaultEffect: settings.default_effect,
      policies: hits.map((policy) => ({ id: policy.id as string, name: policy.name as string, decision: policy.decision as Effect })),
    });
    let effect = decision.effect;
    const policyId = decision.policyId;
    let reason = maskSensitiveText(decision.reason);
    if (effect === "ALLOW") {
      const entitlement = await evaluateWorkspaceExecutionEntitlement(ws);

      if (!entitlement.allowed) {
        effect = "BLOCK";
        reason = maskSensitiveText(
          `Entitlement blocked execution: ${entitlement.reason}`,
        );
      }
    }

    // ---- record ----
    const traceId = maskSensitiveText(str(trace.id, "trace.id", 128, false) ?? randomUUID());
    const dec = await db
      .from("decisions")
      .insert({
        workspace_id: ws,
        agent_id: agent?.id ?? null,
        agent_name: safeAgentName,
        action: safeAction,
        resource: safeResource,
        decision: effect,
        reason,
        policy_id: policyId,
        risk_score: risk,
        trace_id: traceId,
        input: safeInput,
      })
      .select("id")
      .single();
    if (dec.error) throw dec.error;
    const decisionId = dec.data.id as string;

    let executionId: string | null = null;
    if (effect === "ALLOW") {
      const ex = await db
        .from("executions")
        .insert({
          workspace_id: ws,
          agent_id: agent?.id ?? null,
          action: safeAction,
          decision: effect,
          trace_id: traceId,
          risk_score: risk,
        })
        .select("id")
        .single();
      if (ex.error) throw ex.error;
      executionId = ex.data.id as string;
      await db.from("decisions").update({ execution_id: executionId }).eq("id", decisionId);
    }

    const ev = await db
      .from("evidence")
      .insert({
        workspace_id: ws,
        decision_id: decisionId,
        execution_id: executionId,
        agent_id: agent?.id ?? null,
        trace_id: traceId,
        action: safeAction,
        decision: effect,
        payload: {
          agent_id: agent?.id ?? null,
          agent_name: safeAgentName,
          action: safeAction,
          resource: safeResource,
          decision: effect,
          effect,
          reason,
          policy_id: policyId,
          risk_score: risk,
          input: safeInput,
          decided_at: new Date().toISOString(),
        },
      })
      .select("hash")
      .single();
    if (ev.error) throw ev.error;

    const durationMs = Date.now() - t0;
    const provided = Array.isArray(safeTrace.spans) ? safeTrace.spans.slice(0, 200) : [];
    const spans = provided.length ? provided : [{ name: "governance.evaluate", attrs: { action: safeAction, resource: safeResource, effect, policy_id: policyId }, duration_ms: durationMs }];
    await db.from("traces").insert({
      workspace_id: ws, agent_id: agent?.id ?? null, agent_name: safeAgentName, trace_id: traceId,
      name: safeAction, decision_id: decisionId, status: effect.toLowerCase(), duration_ms: durationMs, spans,
    });

    let approvalId: string | null = null;
    if (effect === "ESCALATE") {
      const exp = new Date(Date.now() + settings.expiry_hours * 3600_000).toISOString();
      const ap = await db
        .from("approvals")
        .insert({ workspace_id: ws, decision_id: decisionId, agent_id: agent?.id ?? null, agent_name: safeAgentName, action: safeAction, resource: safeResource, expires_at: exp })
        .select("id")
        .single();
      if (!ap.error) approvalId = ap.data.id as string;
    }
    if (effect === "BLOCK" && settings.alert_on_block) {
      await db.from("incidents").insert({ workspace_id: ws, decision_id: decisionId, severity: risk >= 70 ? "high" : "medium", title: `Blocked: ${safeAgentName} -> ${safeAction}` });
    }
    await db.from("audit_events").insert({
      workspace_id: ws, actor: `api_key:${auth.keyId}`, action: `decision.${effect.toLowerCase()}`,
      target_type: "decision", target_id: decisionId, meta: { agent: safeAgentName, action: safeAction, agent_registered: registered },
    });
    if (agent) await db.from("agents").update({ last_seen_at: new Date().toISOString() }).eq("id", agent.id);

    const event = `decision.${effect.toLowerCase()}`;
    after(() => deliverWebhooks(ws, event, { decision_id: decisionId, agent: safeAgentName, action: safeAction, resource: safeResource, effect, reason, approval_id: approvalId }));

    return NextResponse.json({
      decision_id: decisionId, effect, reason, policy_id: policyId, approval_id: approvalId,
      execution_id: executionId, trace_id: traceId, evidence_hash: ev.data.hash, agent_registered: registered,
    });
  } catch (e) {
    return fail(e);
  }
}

