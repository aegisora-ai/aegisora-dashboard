// Aegisora HTTP client. Zero dependencies. Requires Node 18+ (global fetch).
// Quickstart: /developers/quickstart

export class AegisoraError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "AegisoraError";
    this.status = status;
    this.code = code;
  }
}

export class AegisoraDecisionError extends Error {
  constructor(decision) {
    super("Aegisora " + decision.effect + ": " + decision.reason);
    this.name = "AegisoraDecisionError";
    this.decision = decision;
  }
}

export class Aegisora {
  constructor(options = {}) {
    const env = typeof process !== "undefined" ? process.env : {};
    this.apiKey = options.apiKey ?? env.AEGISORA_API_KEY;
    this.baseUrl = String(options.baseUrl ?? env.AEGISORA_BASE_URL ?? "").replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.failMode = options.failMode ?? "closed";
    if (!this.apiKey) throw new AegisoraError("Missing apiKey (or AEGISORA_API_KEY).");
    if (!this.baseUrl) throw new AegisoraError("Missing baseUrl (or AEGISORA_BASE_URL).");
    if (this.failMode !== "closed" && this.failMode !== "open") {
      throw new AegisoraError("failMode must be 'closed' or 'open'.");
    }
  }

  #degraded(why) {
    const allow = this.failMode === "open";
    return {
      effect: allow ? "ALLOW" : "BLOCK",
      reason: "Aegisora unreachable (" + why + "); fail-" + this.failMode + " mode.",
      degraded: true,
      decision_id: null,
      evidence_hash: null,
    };
  }

  async evaluate(request) {
    const body = {
      agent: request.agent,
      action: request.action,
      resource: request.resource ?? "",
      risk: request.risk ?? 0,
    };
    if (request.input !== undefined) body.input = request.input;
    if (request.trace !== undefined) body.trace = request.trace;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.baseUrl + "/api/v1/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.effect) return data;
      const code = data?.error?.code ?? data?.code;
      const message = data?.error?.message ?? data?.message ?? "HTTP " + res.status;
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw new AegisoraError(message, { status: res.status, code });
      }
      return this.#degraded("HTTP " + res.status);
    } catch (err) {
      if (err instanceof AegisoraError) throw err;
      return this.#degraded(err?.name === "AbortError" ? "timeout" : "network error");
    } finally {
      clearTimeout(timer);
    }
  }

  // Runs fn only when the decision is ALLOW. BLOCK and ESCALATE throw AegisoraDecisionError
  // (decision.approval_id is set for ESCALATE).
  async guard(request, fn) {
    const decision = await this.evaluate(request);
    if (decision.effect !== "ALLOW") throw new AegisoraDecisionError(decision);
    return fn(decision);
  }
}