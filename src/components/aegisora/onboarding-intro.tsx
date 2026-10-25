"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, Search } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const INTRO_KEY = "aegisora:onboarding-intro:v1";

const SIZES = ["1-49", "50-249", "250-999", "1,000-4,999", "5,000+"];
const ROLES = ["Engineering", "Platform / DevOps", "Security", "Data / ML", "Product", "Compliance / Risk", "Founder / Executive", "Other"];
const STACK: { id: string; name: string; mark: string }[] = [
  { id: "openai", name: "OpenAI", mark: "OA" },
  { id: "anthropic", name: "Anthropic", mark: "An" },
  { id: "gemini", name: "Google Gemini", mark: "Ge" },
  { id: "azure", name: "Azure OpenAI", mark: "Az" },
  { id: "bedrock", name: "AWS Bedrock", mark: "Bd" },
  { id: "langchain", name: "LangChain", mark: "LC" },
  { id: "llamaindex", name: "LlamaIndex", mark: "LI" },
  { id: "crewai", name: "CrewAI", mark: "Cr" },
  { id: "autogen", name: "AutoGen", mark: "Ag" },
  { id: "vercel-ai", name: "Vercel AI SDK", mark: "Vx" },
  { id: "mcp", name: "MCP servers", mark: "MC" },
  { id: "custom", name: "In-house agents", mark: "In" },
];

type Answers = { companySize: string | null; role: string | null; stack: string[] };

async function persist(a: Answers) {
  try {
    window.localStorage.setItem(INTRO_KEY, "done");
    window.localStorage.setItem(INTRO_KEY + ":answers", JSON.stringify(a));
  } catch {}
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) await supabase.from("profiles").update({ onboarding: a }).eq("id", data.user.id);
  } catch {}
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-5 py-2 text-sm font-semibold transition",
        focusRing,
        active ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-surface-3 hover:border-foreground/40",
      )}
    >
      {label}
    </button>
  );
}

export function OnboardingIntro({ onDone }: { onDone: () => void }) {
  const total = 3;
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({ companySize: null, role: null, stack: [] });
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const timer = useRef<number | null>(null);

  function pick(key: "companySize" | "role", value: string) {
    setA((cur) => ({ ...cur, [key]: value }));
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStep((s) => Math.min(s + 1, total - 1)), 220);
  }
  function toggle(id: string) {
    setA((cur) => ({ ...cur, stack: cur.stack.includes(id) ? cur.stack.filter((x) => x !== id) : [...cur.stack, id] }));
  }
  async function finish() {
    setSaving(true);
    await persist(a);
    onDone();
  }

  const tiles = STACK.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-5 sm:px-10"><Logo /></header>
      <main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-12 sm:pt-20">
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step + 1}
          className="h-[3px] w-72 max-w-full overflow-hidden rounded-full bg-surface-4"
        >
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>

        {step === 0 && (
          <section aria-labelledby="intro-title">
            <h1 id="intro-title" className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">{"What's your company size?"}</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">This helps us recommend the right policies, limits and setup for your team.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {SIZES.map((s) => <Chip key={s} label={s} active={a.companySize === s} onClick={() => pick("companySize", s)} />)}
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="intro-title">
            <h1 id="intro-title" className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">What best describes your role?</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">We tailor the dashboard and the first recommendations to how you work.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {ROLES.map((r) => <Chip key={r} label={r} active={a.role === r} onClick={() => pick("role", r)} />)}
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="intro-title">
            <h1 id="intro-title" className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">Which agent stack do you run?</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">Select everything your agents use today. We use it to suggest policies and integrations.</p>
            <div className="mt-6 flex h-11 max-w-lg items-center gap-2 rounded-md border border-border bg-card px-3 focus-within:border-primary">
              <Search className="size-4 text-muted-foreground" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search frameworks and providers"
                aria-label="Search frameworks and providers"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="mt-4 max-h-[26rem] overflow-y-auto rounded-xl border border-border p-4">
              {tiles.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No match. Pick In-house agents or skip for now.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {tiles.map((t) => {
                    const on = a.stack.includes(t.id);
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(t.id)}
                          className={cn(
                            "relative flex w-full flex-col items-center gap-2 rounded-lg border p-4 text-center text-xs font-medium transition",
                            focusRing,
                            on ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/30",
                          )}
                        >
                          <span className="grid size-12 place-items-center rounded-lg bg-primary/10 font-mono text-sm font-semibold text-primary">{t.mark}</span>
                          {t.name}
                          {on && (
                            <span className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3" aria-hidden="true" />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="mt-6">
              <button type="button" onClick={() => void finish()} disabled={saving} className={`${btnPrimary} gap-2 disabled:opacity-50`}>
                {saving ? "Saving..." : a.stack.length ? "Continue (" + a.stack.length + ")" : "Continue"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className={cn("underline-offset-4 hover:text-foreground hover:underline", focusRing)}>Back</button>
          )}
          <button type="button" onClick={() => void finish()} className={cn("underline-offset-4 hover:text-foreground hover:underline", focusRing)}>Skip for now</button>
        </div>
      </main>
    </div>
  );
}