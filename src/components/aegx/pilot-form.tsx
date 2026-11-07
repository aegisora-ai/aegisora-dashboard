"use client";

import { useState } from "react";

const EN = {
  name: "Full name", email: "Work email", company: "Company", role: "Role", size: "Company size",
  env: "Your environment (agents, frameworks, systems)", goal: "What do you want to achieve with the pilot?",
  consent: "I agree that Aegisora may contact me about my application.", send: "Send application", sending: "Sending...",
  done: "Thank you. We review every application and reply by email.", err: "Something went wrong. Please try again or email us.",
};
const DE = {
  name: "Vollst\u00e4ndiger Name", email: "Gesch\u00e4ftliche E-Mail", company: "Unternehmen", role: "Rolle", size: "Unternehmensgr\u00f6\u00dfe",
  env: "Deine Umgebung (Agenten, Frameworks, Systeme)", goal: "Was m\u00f6chtest du mit dem Pilot erreichen?",
  consent: "Ich bin einverstanden, dass Aegisora mich zu meiner Bewerbung kontaktiert.", send: "Bewerbung senden", sending: "Wird gesendet...",
  done: "Danke. Wir pr\u00fcfen jede Bewerbung und antworten per E-Mail.", err: "Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreibe uns.",
};
const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="aegx-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export function AegxPilotForm({ locale }: { locale: string }) {
  const t = locale === "de" ? DE : EN;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    f.forEach((v, k) => { body[k] = typeof v === "string" ? v : ""; });
    body.consent = f.get("consent") === "on";
    body.locale = locale;
    setState("sending");
    try {
      const r = await fetch("/api/pilot-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { setState("done"); return; }
      const j = (await r.json().catch(() => null)) as { error?: string } | null;
      setMsg(j?.error ?? t.err);
      setState("error");
    } catch {
      setMsg(t.err);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="aegx-done" role="status">
        <p className="aegx-h3">{t.done}</p>
      </div>
    );
  }

  return (
    <form className="aegx-form" onSubmit={onSubmit} noValidate={false}>
      <div className="aegx-form__row">
        <Field id="pf-name" label={t.name}><input id="pf-name" name="full_name" required maxLength={120} autoComplete="name" /></Field>
        <Field id="pf-email" label={t.email}><input id="pf-email" name="work_email" type="email" required maxLength={200} autoComplete="email" /></Field>
      </div>
      <div className="aegx-form__row">
        <Field id="pf-company" label={t.company}><input id="pf-company" name="company" required maxLength={160} autoComplete="organization" /></Field>
        <Field id="pf-role" label={t.role}><input id="pf-role" name="role_title" maxLength={120} autoComplete="organization-title" /></Field>
      </div>
      <Field id="pf-size" label={t.size}>
        <select id="pf-size" name="company_size" defaultValue="">
          <option value="" />
          {SIZES.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </Field>
      <Field id="pf-env" label={t.env}><textarea id="pf-env" name="environment" maxLength={2000} /></Field>
      <Field id="pf-goal" label={t.goal}><textarea id="pf-goal" name="use_case" required maxLength={3000} /></Field>
      <div className="aegx-hp" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="aegx-check">
        <input type="checkbox" name="consent" required />
        <span>{t.consent}</span>
      </label>
      {state === "error" ? <p className="aegx-form__msg aegx-form__msg--err" role="alert">{msg}</p> : null}
      <button type="submit" className="aegx-btn aegx-btn--solid" disabled={state === "sending"}>
        {state === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}