import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthForm
      title="Log in to Aegisora"
      description="Continue to Aegisora Control."
      fields={[
        { name: "email", label: "Work email", type: "email", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
      ]}
      submitLabel="Log in"
      redirectTo="/dashboard"
      links={[
        { text: "Forgot your password?", label: "Reset it", href: "/forgot-password" },
        { text: "New to Aegisora?", label: "Create a workspace", href: "/signup" },
      ]}
    />
  );
}