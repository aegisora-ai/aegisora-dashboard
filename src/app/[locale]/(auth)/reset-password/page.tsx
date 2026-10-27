"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="bw-auth__h1">{t("reset.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("reset.desc")}</p>

      {error && (
        <p role="alert" className="mt-6 rounded-sm border border-block/30 bg-block-muted px-3 py-2 text-xs text-block">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-6 rounded-sm border border-allow/30 bg-allow-muted px-3 py-2 text-xs text-allow">
          {t("reset.done")}
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("reset.label")}</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </div>
        <button type="submit" disabled={loading || done} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {loading ? t("reset.updating") : t("reset.submit")}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">{t("common.backToLogin")}</Link>
      </p>
    </div>
  );
}