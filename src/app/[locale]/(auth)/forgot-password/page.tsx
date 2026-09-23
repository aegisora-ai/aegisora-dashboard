import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      mode="reset"
      title="Reset your password"
      description="We'll send a reset link to your work email."
      fields={[{ name: "email", label: "Work email", type: "email", autoComplete: "email" }]}
      submitLabel="Send reset link"
      redirectTo="/login"
      links={[{ text: "Remembered it?", label: "Log in", href: "/login" }]}
    />
  );
}