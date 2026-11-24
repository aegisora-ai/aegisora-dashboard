"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
  pilot: "Pilot",
  founder_pilot: "Pilot",
  business: "Business",
  enterprise: "Enterprise",
};

type StatusResponse = {
  success?: boolean;
  entitlement?: { plan_key?: string; status?: string } | null;
  subscription?: { plan_key?: string } | null;
};

export function PlanBadge() {
  const [plan, setPlan] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/status", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as StatusResponse;
      if (!data.success) return;
      const key = data.entitlement?.status === "active" ? data.entitlement.plan_key : data.subscription?.plan_key;
      setPlan(key ?? null);
    } catch {
      // the badge is optional
    }
  }, []);

  useEffect(() => {
    void load();
    const onUpdate = () => void load();
    window.addEventListener("aegisora-billing-updated", onUpdate);
    return () => window.removeEventListener("aegisora-billing-updated", onUpdate);
  }, [load]);

  if (!plan) return null;
  const paid = plan !== "free";
  const label = LABELS[plan] ?? plan;

  return (
    <Link
      href="/dashboard/billing"
      aria-label={"Plan: " + label}
      className={
        "inline-flex h-7 items-center rounded-full border px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider " +
        (paid ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border text-muted-foreground")
      }
    >
      {label}
    </Link>
  );
}