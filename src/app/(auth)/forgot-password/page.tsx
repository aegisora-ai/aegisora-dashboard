import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Reset your password"
      description="Enter your work email to receive reset instructions."
      fields={[{ name: "email", label: "Work email", type: "email", autoComplete: "email" }]}
      submitLabel="Send reset link"
      redirectTo="/reset-password"
      links={[{ text: "Remembered it?", label: "Back to log in", href: "/login" }]}
    />
  );
}