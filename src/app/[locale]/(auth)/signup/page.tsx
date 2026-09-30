import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Create your Aegisora account" };

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title="Create your Aegisora account"
      description="Create your account, secure the workspace, register an agent, and persist a first policy before connecting your backend integration."
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
