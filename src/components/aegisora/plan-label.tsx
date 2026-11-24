"use client";

import { useCallback, useEffect, useState } from "react";

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

export function PlanLabel() {
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
      // the label is optional
    }
  }, []);

  useEffect(() => {
    void load();
    const onUpdate = () => void load();
    window.addEventListener("aegisora-billing-updated", onUpdate);
    return () => window.removeEventListener("aegisora-billing-updated", onUpdate);
  }, [load]);

  if (!plan) return null;
  return <> {"\u00B7"} {LABELS[plan] ?? plan}</>;
}