"use client";

import { useEffect, useState } from "react";
import { Bot, Check, Lock, Scale, ScrollText, ShieldCheck, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const KEY = "aegisora:welcome-tour:v1";

const STEPS = [
  { icon: ShieldCheck, title: "Welcome to Aegisora Control",
    body: "Aegisora sits between your AI agents and the actions they take. Every action is checked against your policies, decided, and recorded as evidence. This short tour gets you to your first test." },
  { icon: Lock, title: "1. Secure your account",
    body: "Creating agents, policies and API keys requires multi-factor authentication. Enroll an authenticator app once; it takes about a minute.", href: "/dashboard/identity", cta: "Open Identity" },
  { icon: Bot, title: "2. Connect an agent",
    body: "Agents are the AI workers you want to govern. Register one, then use its API key in your runtime.", href: "/dashboard/agents", cta: "Open Agents" },
  { icon: ScrollText, title: "3. Define a policy",
    body: "Policies decide what an agent may do: allow, block, or require human approval. Start with one simple rule.", href: "/dashboard/policies", cta: "Open Policies" },
  { icon: Scale, title: "4. Run your first test",
    body: "Send a test action from your agent. You will see the decision, its trace, and the evidence record.", href: "/dashboard/decisions", cta: "Open Decisions" },
  { icon: Check, title: "You are ready",
    body: "Everything you did is recorded under Evidence and Audit. You can reopen any section from the menu." },
];

export function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user || !alive) return;
        try { if (localStorage.getItem(KEY)) return; } catch { /* ignore */ }
        const { data, error } = await supabase
          .from("profiles").select("onboarded_at").eq("id", auth.user.id).maybeSingle();
        if (!alive) return;
        if (error) {
          // onboarded_at kolonu henuz yoksa tarayici yedegine dus
          if (!localStorage.getItem(KEY)) setOpen(true);
          return;
        }
        if (!data?.onboarded_at) setOpen(true);
      } catch { /* sessiz gec */ }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") void close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function close() {
    setOpen(false);
    try { localStorage.setItem(KEY, "done"); } catch { /* ignore */ }
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (auth.user) {
        await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", auth.user.id);
      }
    } catch { /* ignore */ }
  }

  if (!open) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Welcome tour">
      <div className="aeg-panel w-full max-w-md bg-popover p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
            <s.icon className="size-5" />
          </div>
          <button type="button" onClick={() => void close()} aria-label="Skip tour" className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <h2 className="mt-4 text-lg font-semibold">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
        {s.href && (
          <Link href={s.href} onClick={() => void close()} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">{s.cta} &rarr;</Link>
        )}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary" : "w-1.5 bg-surface-4"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!last && <button type="button" onClick={() => void close()} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Skip</button>}
            {step > 0 && !last && <button type="button" onClick={() => setStep(step - 1)} className="px-3 py-1.5 text-sm">Back</button>}
            <button type="button" onClick={() => (last ? void close() : setStep(step + 1))} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
              {last ? "Start exploring" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}