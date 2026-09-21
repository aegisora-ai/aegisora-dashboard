import Link from "next/link";
import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/aegisora/onboarding-flow";

export const metadata: Metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  return (
    <>
      <header className="border-b border-border bg-surface-1">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em]">AEGISORA</Link>
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Skip to Control</Link>
        </div>
      </header>
      <OnboardingFlow />
    </>
  );
}