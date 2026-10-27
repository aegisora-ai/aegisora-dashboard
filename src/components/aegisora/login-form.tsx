"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";
import { SocialButtons } from "./social-buttons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const t = useTranslations("Auth");
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "password") pwRef.current?.focus();
    else mailRef.current?.focus();
  }, [step]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (step === "email") {
      if (!EMAIL_RE.test(email.trim())) {
        setError(t("login.invalidEmail"));
        return;
      }
      setStep("password");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
      window.location.href = redirectTo;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("common.genericError");
      setError(msg.toLowerCase().includes("invalid login credentials") ? t("login.badCredentials") : msg);
      setLoading(false);
    }
  }

  function change() {
    setStep("email");
    setPassword("");
    setShow(false);
    setError(null);
  }

  const locked = step === "password";

  return (
    <div>
      <h1 className="bw-auth__h1">{t("login.title")}</h1>
      <p className="mt-3 text-sm">
        <span className="text-muted-foreground">{t("login.newHere")} </span>
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">{t("login.signUp")}</Link>
      </p>

      <div className="mt-8">
        <SocialButtons onError={setError} />
      </div>

      {error ? (
        <p role="alert" className="mt-5 rounded-sm border border-block/30 bg-block-muted px-3 py-2 text-xs text-block">
          {error}
        </p>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("common.email")}</Label>
          <div className="relative">
            <Input
              ref={mailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={locked}
              tabIndex={locked ? -1 : 0}
              className={locked ? "bg-surface-3 pr-24 text-muted-foreground" : ""}
            />
            {locked ? (
              <button
                type="button"
                onClick={change}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline"
              >
                {t("login.change")}
              </button>
            ) : null}
          </div>
        </div>

        {locked ? (
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("common.password")}</Label>
            <div className="relative">
              <Input
                ref={pwRef}
                id="password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? t("common.hide") : t("common.show")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <Link href="/forgot-password" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
                {t("login.forgot")}
              </Link>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || (locked ? password === "" : email.trim() === "")}
          className={`${btnPrimary} w-full disabled:opacity-60`}
        >
          {loading ? t("common.wait") : locked ? t("login.signIn") : t("login.next")}
        </button>
      </form>
    </div>
  );
}