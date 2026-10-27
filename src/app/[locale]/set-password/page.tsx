"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { createBrowserClient } from "@supabase/ssr";
import { Link } from "@/i18n/navigation";
import { authCookieOptions } from "@/lib/supabase/cookie-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";

function PasswordField({
  id, label, value, onChange, show, onToggle, showLabel, hideLabel, autoFocus,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; showLabel: string; hideLabel: string; autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          autoFocus={autoFocus}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? hideLabel : showLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
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
  if (pw.length === 0) return { score: 0, key: "" };
  const i = Math.max(1, score);
  return { score: i, key: ["tooShort", "weak", "fair", "good", "strong"][i] };
}

export default function SetPasswordPage() {
  const t = useTranslations("Auth");
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
  const barColor = st.score <= 1 ? "bg-block" : st.score === 2 ? "bg-escalate" : "bg-allow";
  const txtColor = st.score <= 1 ? "text-block" : st.score === 2 ? "text-escalate" : "text-allow";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError(t("setPw.errLen"));
    if (password !== confirm) return setError(t("setPw.errMatch"));
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    window.location.assign("/dashboard");
  }

  if (!ready) return <p className="text-sm text-muted-foreground">{t("setPw.loading")}</p>;

  if (!hasSession) {
    return (
      <div>
        <h1 className="bw-auth__h1">{t("setPw.expiredTitle")}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t.rich("setPw.expiredBody", {
            login: (chunks) => (
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">{chunks}</Link>
            ),
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1 className="bw-auth__h1">{t("setPw.title")}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {email
          ? t.rich("setPw.forEmail", { email, b: (chunks) => <strong className="text-foreground">{chunks}</strong> })
          : t("setPw.forNoEmail")}
      </p>

      <div className="mt-6 space-y-4">
        <PasswordField
          id="pw" label={t("setPw.newPassword")} value={password} onChange={setPassword}
          show={showPw} onToggle={() => setShowPw((v) => !v)}
          showLabel={t("common.show")} hideLabel={t("common.hide")} autoFocus
        />

        {password.length > 0 && (
          <div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={"h-1 flex-1 rounded-sm " + (n <= st.score ? barColor : "bg-border")} />
              ))}
            </div>
            <div className={"mt-1.5 text-xs " + txtColor}>{t("setPw." + st.key)}</div>
          </div>
        )}

        <PasswordField
          id="pw2" label={t("setPw.repeat")} value={confirm} onChange={setConfirm}
          show={showConfirm} onToggle={() => setShowConfirm((v) => !v)}
          showLabel={t("common.show")} hideLabel={t("common.hide")}
        />

        {mismatch && <p className="text-xs text-block">{t("setPw.errMatch")}</p>}
        {error && <p role="alert" className="text-xs text-block">{error}</p>}

        <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {busy ? t("setPw.saving") : t("setPw.submit")}
        </button>

        <p className="text-center text-xs text-muted-foreground">{t("setPw.hint")}</p>
      </div>
    </form>
  );
}