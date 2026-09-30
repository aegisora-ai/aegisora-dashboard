"use client";

import { useEffect, useState } from "react";
import { PartyPopper, Bot, Scale, ScrollText, ShieldCheck, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const KEY = "aegisora:welcome-tour:v1";

const STEPS = [
  { icon: ShieldCheck, title: "Welcome to Aegisora Control",
    body: "Aegisora sits between your AI agents and the actions they take. Every action is checked against your policies, decided, and recorded as evidence. This short tour gets you to your first test." },
  { icon: Bot, title: "1. Connect an agent",
    body: "Agents are the AI workers you want to govern. Register one, then use its API key in your runtime.", href: "/dashboard/agents", cta: "Open Agents" },
  { icon: ScrollText, title: "2. Define a policy",
    body: "Policies decide what an agent may do: allow, block, or require human approval. Start with one simple rule.", href: "/dashboard/policies", cta: "Open Policies" },
  { icon: Scale, title: "3. Run your first test",
    body: "Send a test action from your agent. You will see the decision, its trace, and the evidence record.", href: "/dashboard/decisions", cta: "Open Decisions" },
  { icon: PartyPopper, title: "Welcome to Aegisora",
    body: "You are all set. Explore freely." },
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
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050b18] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
            <s.icon className="h-5 w-5" />
          </div>
          <button onClick={() => void close()} aria-label="Skip tour" className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
        {s.href && (
          <Link href={s.href} onClick={() => void close()} className="mt-3 inline-block text-sm text-blue-400 hover:underline">{s.cta} →</Link>
        )}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-blue-500" : "w-1.5 bg-slate-700"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!last && <button onClick={() => void close()} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-300">Skip</button>}
            {step > 0 && !last && <button onClick={() => setStep(step - 1)} className="px-3 py-1.5 text-sm text-slate-300">Back</button>}
            <button onClick={() => (last ? void close() : setStep(step + 1))} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
              {last ? "Start exploring" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

