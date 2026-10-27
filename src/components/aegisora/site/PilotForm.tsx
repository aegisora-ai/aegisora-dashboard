"use client";

import { useState, type FormEvent } from "react";

const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const TXT = {
  en: {
    name: "Full name", email: "Work email", company: "Company", role: "Your role", size: "Company size", select: "Select",
    env: "Agents and environment", envPh: "Which agents, frameworks and systems are involved?",
    use: "What do you want to prove in the pilot?", web: "Website",
    consent: "I agree that Aegisora may process this information to answer my application.",
    submit: "Submit application", sending: "Sending...",
    okTitle: "Application received", okBody: "Thank you. We will review it and reply by email.",
    errGeneric: "Something went wrong. Please try again or email us.", errNet: "Network error. Please try again or email us.",
  },
  de: {
    name: "Vollst\u00e4ndiger Name", email: "Gesch\u00e4ftliche E-Mail", company: "Unternehmen", role: "Ihre Rolle", size: "Unternehmensgr\u00f6\u00dfe", select: "Bitte w\u00e4hlen",
    env: "Agenten und Umgebung", envPh: "Welche Agenten, Frameworks und Systeme sind beteiligt?",
    use: "Was m\u00f6chten Sie im Pilot nachweisen?", web: "Website",
    consent: "Ich bin damit einverstanden, dass Aegisora diese Angaben verarbeitet, um meine Bewerbung zu beantworten.",
    submit: "Bewerbung senden", sending: "Wird gesendet...",
    okTitle: "Bewerbung eingegangen", okBody: "Vielen Dank. Wir pr\u00fcfen sie und antworten per E-Mail.",
    errGeneric: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns eine E-Mail.",
    errNet: "Netzwerkfehler. Bitte versuchen Sie es erneut oder schreiben Sie uns eine E-Mail.",
  },
};

export default function PilotForm({ locale }: { locale: string }) {
  const L = locale === "de" ? TXT.de : TXT.en;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState("error");
        setMessage(json.error ?? L.errGeneric);
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setState("error");
      setMessage(L.errNet);
    }
  }

  if (state === "done") {
    return (
      <div className="pv-ok">
        <h3>{L.okTitle}</h3>
        <p>{L.okBody}</p>
      </div>
    );
  }

  return (
    <form className="pv-form" onSubmit={onSubmit}>
      <div className="pv-row">
        <div className="pv-field">
          <label htmlFor="pf-name">{L.name}</label>
          <input id="pf-name" name="full_name" required maxLength={120} autoComplete="name" />
        </div>
        <div className="pv-field">
          <label htmlFor="pf-email">{L.email}</label>
          <input id="pf-email" name="work_email" type="email" required maxLength={200} autoComplete="email" />
        </div>
      </div>
      <div className="pv-row">
        <div className="pv-field">
          <label htmlFor="pf-company">{L.company}</label>
          <input id="pf-company" name="company" required maxLength={160} autoComplete="organization" />
        </div>
        <div className="pv-field">
          <label htmlFor="pf-role">{L.role}</label>
          <input id="pf-role" name="role_title" maxLength={120} autoComplete="organization-title" />
        </div>
      </div>
      <div className="pv-field">
        <label htmlFor="pf-size">{L.size}</label>
        <select id="pf-size" name="company_size" defaultValue="">
          <option value="">{L.select}</option>
          {SIZES.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>
      <div className="pv-field">
        <label htmlFor="pf-env">{L.env}</label>
        <textarea id="pf-env" name="environment" rows={3} maxLength={2000} placeholder={L.envPh} />
      </div>
      <div className="pv-field">
        <label htmlFor="pf-use">{L.use}</label>
        <textarea id="pf-use" name="use_case" rows={4} required maxLength={3000} />
      </div>
      <div className="pv-hp" aria-hidden="true">
        <label htmlFor="pf-web">{L.web}</label>
        <input id="pf-web" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="pv-check">
        <input type="checkbox" name="consent" required />
        <span>{L.consent}</span>
      </label>
      <button type="submit" className="bw-btn bw-btn--blue bw-btn--lg pv-submit" disabled={state === "sending"}>
        {state === "sending" ? L.sending : L.submit}
      </button>
      {state === "error" ? (<p className="pv-err" role="alert">{message}</p>) : null}
    </form>
  );
}
