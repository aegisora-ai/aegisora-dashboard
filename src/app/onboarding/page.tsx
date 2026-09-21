import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/aegisora/logo";
import { OnboardingFlow } from "@/components/aegisora/onboarding-flow";
import { ThemeToggle } from "@/components/aegisora/theme-toggle";

export const metadata: Metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  return (
    <>
      <header className="border-b border-border bg-surface-1">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Skip to Control</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <OnboardingFlow />
    </>
  );
}