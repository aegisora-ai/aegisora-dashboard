"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CSSProperties, FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions } from "@/lib/supabase/cookie-options";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.9 10.9 0 0 1 12 19C5.5 19 2 12 2 12a18.7 18.7 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function PasswordField({
  id, label, value, onChange, show, onToggle, autoFocus,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; autoFocus?: boolean;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={s.label}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          autoFocus={autoFocus}
          style={s.input}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          style={s.eye}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#ef4444", "#f59e0b", "#22c55e", "#22c55e"];
  const i = pw.length === 0 ? 0 : Math.max(1, score);
  return { score: pw.length === 0 ? 0 : i, label: pw.length === 0 ? "" : labels[i], color: colors[i] };
}

export default function SetPasswordPage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      { cookieOptions: authCookieOptions },
    ),
  );
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setEmail(data.user?.email ?? "");
      setReady(true);
    });
  }, [supabase]);

  const st = strength(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    window.location.assign("/dashboard");
  }

  return (
    <main style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          <Image src="/email-logo.png" alt="Aegisora" width={28} height={28} priority style={{ height: 28, width: "auto", display: "block" }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.2 }}>Aegisora</span>
        </div>

        {!ready ? (
          <p style={s.muted}>Loading...</p>
        ) : !hasSession ? (
          <>
            <h1 style={s.h1}>Link expired or invalid</h1>
            <p style={s.muted}>
              This invitation link can no longer be used. Please ask your administrator for a new invitation, or{" "}
              <Link href="/login" style={{ color: "#6ea8ff" }}>log in</Link> if you already have an account.
            </p>
          </>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <h1 style={s.h1}>Set your password</h1>
            <p style={s.muted}>
              {email ? <>Create a password for <strong style={{ color: "#e6edf7" }}>{email}</strong> to finish setting up your account.</> : "Create a password to finish setting up your account."}
            </p>

            <div style={{ height: 22 }} />

            <PasswordField id="pw" label="New password" value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw((v) => !v)} autoFocus />

            {password.length > 0 && (
              <div style={{ margin: "-8px 0 18px" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= st.score ? st.color : "rgba(255,255,255,0.12)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: st.color }}>{st.label}</div>
              </div>
            )}

            <PasswordField id="pw2" label="Repeat password" value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />

            {mismatch && <p style={{ ...s.err, marginTop: -8 }}>Passwords do not match.</p>}
            {error && <p style={s.err} role="alert">{error}</p>}

            <button type="submit" disabled={busy} style={{ ...s.btn, opacity: busy ? 0.7 : 1, cursor: busy ? "default" : "pointer" }}>
              {busy ? "Saving..." : "Save and continue"}
            </button>

            <p style={{ ...s.muted, fontSize: 12, marginTop: 16, textAlign: "center" }}>
              Use at least 8 characters. A mix of letters, numbers and symbols is stronger.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24, fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif", color: "#e6edf7",
  },
  card: {
    width: "100%", maxWidth: 420, padding: 32, borderRadius: 16,
    background: "rgba(14, 22, 38, 0.85)", border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", boxSizing: "border-box",
  },
  brand: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  h1: { fontSize: 24, fontWeight: 600, margin: "0 0 8px" },
  muted: { fontSize: 14, lineHeight: 1.5, color: "#9fb0c8", margin: 0 },
  label: { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#c9d6e8" },
  input: {
    width: "100%", boxSizing: "border-box", padding: "12px 44px 12px 14px", fontSize: 15,
    color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10, outline: "none",
  },
  eye: {
    position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: 0, borderRadius: 8, color: "#9fb0c8", cursor: "pointer",
  },
  err: { color: "#f87171", fontSize: 13, margin: "0 0 14px" },
  btn: {
    width: "100%", padding: "13px 20px", fontSize: 15, fontWeight: 600, color: "#fff",
    background: "#1463e6", border: 0, borderRadius: 10, marginTop: 4,
  },
};


