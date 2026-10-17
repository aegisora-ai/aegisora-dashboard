"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";
import { SocialButtons } from "./social-buttons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={"flex items-center gap-2 text-xs " + (ok ? "text-allow" : "text-muted-foreground")}>
      <Check className="size-3.5 shrink-0" aria-hidden />
      {children}
    </li>
  );
}

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [show, setShow] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const mail = email.trim().toLowerCase();
  const longEnough = password.length >= 8;
  const noEmail = password.length > 0 && !(mail && password.toLowerCase().includes(mail));
  const valid = Boolean(EMAIL_RE.test(email.trim()) && first.trim() && last.trim() && longEnough && noEmail && accepted);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const firstName = first.trim();
      const lastName = last.trim();
      const supabase = createClient();
      // handle_new_user tetikleyicisi company bilgisinden workspace olusturur.
      // Bos birakilirsa tetikleyicinin bos deger gormemesi icin varsayilan bir ad gonderilir.
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: firstName + " " + lastName,
            first_name: firstName,
            last_name: lastName,
            company: company.trim() || firstName + "'s workspace",
          },
        },
      });
      if (err) throw err;
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error("An account with this email already exists. Log in instead.");
      }
      if (data.session) {
        window.location.href = redirectTo;
        return;
      }
      setNotice("Check your inbox to confirm your email, then log in.");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="aeg-display text-4xl">Create your Aegisora account</h1>
      <p className="mt-3 text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Log in</Link>
      </p>

      <div className="mt-8">
        <SocialButtons onError={setError} />
      </div>

      {error ? (
        <p role="alert" className="mt-5 rounded-sm border border-block/30 bg-block-muted px-3 py-2 text-xs text-block">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-5 rounded-sm border border-cyan/30 bg-surface-3 px-3 py-2 text-xs text-cyan">
          {notice}
        </p>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <p className="text-xs text-muted-foreground">We recommend using your work email.</p>
          <Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="first">First name</Label>
            <Input id="first" name="first" type="text" autoComplete="given-name" value={first} onChange={(e) => setFirst(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last">Last name</Label>
            <Input id="last" name="last" type="text" autoComplete="family-name" value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
          <ul className="space-y-1 pt-1">
            <Rule ok={longEnough}>Must be at least 8 characters</Rule>
            <Rule ok={noEmail}>Does not contain your email address</Rule>
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company">Company name <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="company" name="company" type="text" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        <label className="flex items-start gap-3 text-sm leading-5">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
          <span>
            I accept the{" "}
            <Link href="/privacy" target="_blank" className="text-primary underline-offset-4 hover:underline">Privacy Policy</Link>{" "}
            and the{" "}
            <Link href="/terms" target="_blank" className="text-primary underline-offset-4 hover:underline">Terms of Service</Link>
          </span>
        </label>

        <button type="submit" disabled={loading || !valid} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {loading ? "Please wait..." : "Create account"}
        </button>
      </form>
    </div>
  );
}