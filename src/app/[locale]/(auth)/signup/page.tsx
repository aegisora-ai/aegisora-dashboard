import type { Metadata } from "next";
import { AuthShell } from "@/components/aegisora/auth-shell";
import { SignupForm } from "@/components/aegisora/signup-form";

export const metadata: Metadata = { title: "Create your Aegisora account" };

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm redirectTo="/onboarding" />
    </AuthShell>
  );
}