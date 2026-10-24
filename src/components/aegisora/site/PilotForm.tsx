"use client";

import { useState, type FormEvent } from "react";
import styles from "./site.module.css";

const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

export default function PilotForm({ locale }: { locale: string }) {
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
        setMessage(json.error ?? "Something went wrong. Please try again or email us.");
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setState("error");
      setMessage("Network error. Please try again or email us.");
    }
  }

  if (state === "done") {
    return (
      <div className={styles.formOk}>
        <h3 className={styles.h3}>Application received</h3>
        <p className={styles.body}>Thank you. We will review it and reply by email.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="pf-name">Full name</label>
          <input id="pf-name" name="full_name" required maxLength={120} autoComplete="name" />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-email">Work email</label>
          <input id="pf-email" name="work_email" type="email" required maxLength={200} autoComplete="email" />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="pf-company">Company</label>
          <input id="pf-company" name="company" required maxLength={160} autoComplete="organization" />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-role">Your role</label>
          <input id="pf-role" name="role_title" maxLength={120} autoComplete="organization-title" />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="pf-size">Company size</label>
        <select id="pf-size" name="company_size" defaultValue="">
          <option value="">Select</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="pf-env">Agents and environment</label>
        <textarea
          id="pf-env"
          name="environment"
          rows={3}
          maxLength={2000}
          placeholder="Which agents, frameworks and systems are involved?"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pf-use">What do you want to prove in the pilot?</label>
        <textarea id="pf-use" name="use_case" rows={4} required maxLength={3000} />
      </div>
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="pf-web">Website</label>
        <input id="pf-web" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className={styles.check}>
        <input type="checkbox" name="consent" required />
        <span>I agree that Aegisora may process this information to answer my application.</span>
      </label>
      <button type="submit" className={styles.btnPrimary} disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Submit application"}
      </button>
      {state === "error" ? (
        <p className={styles.formErr} role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}