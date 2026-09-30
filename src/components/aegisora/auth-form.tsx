"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";

type Field = { name: string; label: string; type: string; autoComplete?: string };
type Mode = "login" | "signup" | "reset" | "invite";

type Props = {
  mode: Mode;
  title: string;
  description: string;
  fields: Field[];
  submitLabel: string;
  redirectTo: string;
  links?: { text: string; label: string; href: string }[];
};

const companyField: Field = { name: "company", label: "Company", type: "text", autoComplete: "organization" };

function withCompany(mode: Mode, fields: Field[]): Field[] {
  if (mode !== "signup" || fields.some((f) => f.name === "company")) return fields;
  const i = fields.findIndex((f) => f.name === "password");
  return i === -1 ? [...fields, companyField] : [...fields.slice(0, i), companyField, ...fields.slice(i)];
}

export function AuthForm({ mode, title, description, fields, submitLabel, redirectTo, links }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const allFields = withCompany(mode, fields);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("name") ?? "").trim();
    const company = String(form.get("company") ?? "").trim();

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        window.location.href = redirectTo;
        return;
      }

      if (mode === "signup") {
        // Workspace, veritabanindaki handle_new_user tetikleyicisi tarafindan
        // company bilgisinden olusturulur (e-posta onayi olsa da calisir).
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, ...(company ? { company } : {}) } },
        });
        if (err) throw err;
        if (data.session) {
          window.location.href = redirectTo;
        } else {
          setNotice("Check your inbox to confirm your email, then log in.");
        }
        return;
      }

      if (mode === "reset") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (err) throw err;
        setNotice("If an account exists for that email, a reset link is on its way.");
        return;
      }

      if (mode === "invite") {
        const { error: err } = await supabase.auth.updateUser({
          password,
          data: { full_name: fullName },
        });
        if (err) throw err;
        window.location.href = redirectTo;
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      {error && (
        <p role="alert" className="mt-6 rounded-sm border border-block/30 bg-block-muted px-3 py-2 text-xs text-block">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-6 rounded-sm border border-cyan/30 bg-surface-3 px-3 py-2 text-xs text-cyan">
          {notice}
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {allFields.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <Label htmlFor={f.name}>{f.label}</Label>
            <Input id={f.name} name={f.name} type={f.type} autoComplete={f.autoComplete} required />
          </div>
        ))}
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {loading ? "Please wait..." : submitLabel}
        </button>
      </form>

      {links && (
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          {links.map((l) => (
            <li key={l.href}>
              {l.text}{" "}
              <Link href={l.href} className="text-cyan underline-offset-4 hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



