import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthForm
      title="Choose a new password"
      description="Set a new password for your Aegisora account."
      fields={[
        { name: "password", label: "New password", type: "password", autoComplete: "new-password" },
        { name: "confirm", label: "Confirm password", type: "password", autoComplete: "new-password" },
      ]}
      submitLabel="Update password"
      redirectTo="/login"
    />
  );
}