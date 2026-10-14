import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Sign in to Aegisora" };

export default function LoginPage() {
  return (
    <AuthForm
      mode="login"
      title="Sign in to workspace"
      description="Use your work email to continue to your Aegisora workspace."
      fields={[
        { name: "email", label: "Work email", type: "email", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
      ]}
      submitLabel="Sign in"
      redirectTo="/dashboard"
      links={[
        { text: "New to Aegisora?", label: "Create an account", href: "/signup" },
        { text: "Forgot your password?", label: "Reset it", href: "/forgot-password" },
      ]}
    />
  );
}