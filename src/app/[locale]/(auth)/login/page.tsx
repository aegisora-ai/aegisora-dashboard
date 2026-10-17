import type { Metadata } from "next";
import { AuthShell } from "@/components/aegisora/auth-shell";
import { LoginForm } from "@/components/aegisora/login-form";

export const metadata: Metadata = { title: "Sign in to Aegisora" };

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm redirectTo="/dashboard" />
    </AuthShell>
  );
}