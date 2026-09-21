import Link from "next/link";
import type { Metadata } from "next";
import { btnPrimary } from "@/lib/ui";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        In a connected deployment, a verification link is sent to your work email. Follow it to activate your account.
      </p>
      <p className="mt-6 rounded-sm border border-escalate/30 bg-escalate-muted px-3 py-2 text-xs text-escalate">
        Prototype: no email is sent.
      </p>
      <Link href="/onboarding" className={`${btnPrimary} mt-6 w-full`}>Continue to onboarding</Link>
    </div>
  );
}