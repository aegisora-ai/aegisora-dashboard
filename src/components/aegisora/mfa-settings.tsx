"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TotpFactor = { id: string; status: "verified" | "unverified"; friendly_name?: string };

export function MfaSettings() {
  const supabase = useMemo(() => createClient(), []);
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [aal, setAal] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [{ data: factorData, error: factorError }, { data: assuranceData, error: assuranceError }] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);
    if (factorError) throw factorError;
    if (assuranceError) throw assuranceError;
    const totp = factorData.totp as TotpFactor[];
    setFactors(totp);
    setAal(assuranceData.currentLevel);
    setPendingId((current) => current ?? totp.find((factor) => factor.status === "unverified")?.id ?? null);
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load MFA status."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function enroll() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Aegisora authenticator" });
    if (enrollError) {
      setError(enrollError.message);
    } else if (data.type === "totp") {
      setPendingId(data.id);
      setQrCode(`data:image/svg+xml;utf-8,${encodeURIComponent(data.totp.qr_code)}`);
      setSecret(data.totp.secret);
      setNotice("Scan the QR code in an authenticator app, then enter its current six-digit code.");
    }
    setBusy(false);
  }

  async function verify() {
    const factorId = pendingId ?? factors.find((factor) => factor.status === "verified")?.id;
    if (!factorId) {
      setError("Enroll an authenticator app first.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.replace(/\s/g, "") });
    if (verifyError) {
      setError(verifyError.message);
    } else {
      setQrCode(null);
      setSecret(null);
      setCode("");
      setNotice("Authenticator verified. This session now has AAL2 for protected workspace changes.");
      await refresh();
    }
    setBusy(false);
  }

  async function discardPending() {
    if (!pendingId) return;
    setBusy(true);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: pendingId });
    if (unenrollError) setError(unenrollError.message);
    else {
      setPendingId(null);
      setQrCode(null);
      setSecret(null);
      setNotice("Unverified authenticator setup removed.");
      await refresh();
    }
    setBusy(false);
  }

  const verified = factors.some((factor) => factor.status === "verified");

  return (
    <section aria-labelledby="mfa-title" className="aeg-panel p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 id="mfa-title" className="text-sm font-medium">Multi-factor authentication</h2>
        <span className={`font-mono text-[11px] tracking-wider ${verified ? "text-allow" : "text-block"}`}>
          {verified ? "AUTHENTICATOR ENROLLED" : "NOT ENROLLED"}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        OWNER and ADMIN changes require a verified authenticator and an AAL2 session. After signing in, verify a code here to step up the current session.
      </p>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">CURRENT SESSION: {aal?.toUpperCase() ?? "CHECKING"}</p>

      {qrCode && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-sm border border-border p-4">
          {/* Supabase returns a locally generated SVG data URI for TOTP enrollment. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="Authenticator enrollment QR code" className="h-40 w-40 bg-white p-2" />
          <div>
            <p className="text-xs text-muted-foreground">Manual setup key</p>
            <code className="mt-1 block break-all font-mono text-sm">{secret}</code>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-block">{error}</p>}
      {notice && <p role="status" className="mt-4 text-sm text-cyan">{notice}</p>}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        {!verified && !pendingId && (
          <button type="button" disabled={busy} onClick={() => void enroll()} className="rounded-sm border border-cyan/50 px-4 py-2 text-sm text-cyan disabled:opacity-50">
            {busy ? "Starting…" : "Enroll authenticator"}
          </button>
        )}
        {(pendingId || verified) && (
          <>
            <label className="text-xs text-muted-foreground" htmlFor="mfa-code">
              {verified ? "Authenticator code" : "Verify enrollment code"}
              <input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 block w-44 rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-sm" />
            </label>
            <button type="button" disabled={busy || code.trim().length < 6} onClick={() => void verify()} className="rounded-sm border border-cyan/50 px-4 py-2 text-sm text-cyan disabled:opacity-50">
              {busy ? "Verifying…" : "Verify code"}
            </button>
          </>
        )}
        {pendingId && !qrCode && (
          <button type="button" disabled={busy} onClick={() => void discardPending()} className="px-2 py-2 text-xs text-muted-foreground disabled:opacity-50">Discard incomplete setup</button>
        )}
      </div>
    </section>
  );
}
