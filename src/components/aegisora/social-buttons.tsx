"use client";

import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "github";

// Ornek: NEXT_PUBLIC_AUTH_PROVIDERS=google,github  (bos ise butonlar gorunmez)
const ENABLED = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const btn =
  "flex h-11 w-full items-center justify-center gap-3 rounded border border-border bg-surface-1 text-sm font-semibold transition hover:bg-surface-3 disabled:opacity-60";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
      <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.6 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.28 12 6.28c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12S6.92 21.2 12 21.2c5.28 0 8.78-3.7 8.78-8.93 0-.6-.07-1.06-.15-1.17z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-1.97c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export function SocialButtons({ onError }: { onError: (message: string) => void }) {
  if (ENABLED.length === 0) return null;

  async function go(provider: Provider) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + "/api/auth/callback" },
    });
    if (error) onError(error.message);
  }

  return (
    <div className="space-y-3">
      {ENABLED.includes("google") ? (
        <button type="button" onClick={() => go("google")} className={btn}>
          <GoogleIcon /> Google
        </button>
      ) : null}
      {ENABLED.includes("github") ? (
        <button type="button" onClick={() => go("github")} className={btn}>
          <GithubIcon /> GitHub
        </button>
      ) : null}
      <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or continue with email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}