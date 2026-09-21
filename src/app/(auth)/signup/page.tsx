import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Test Aegisora" };

export default function SignupPage() {
  return (
    <AuthForm
      title="Test Aegisora"
      description="Create a workspace, connect an agent and see ALLOW, BLOCK and ESCALATE decisions."
      fields={[
        { name: "name", label: "Full name", type: "text", autoComplete: "name" },
        { name: "email", label: "Work email", type: "email", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
      ]}
      submitLabel="Continue"
      redirectTo="/onboarding"
      links={[{ text: "Already have an account?", label: "Log in", href: "/login" }]}
    />
  );
}