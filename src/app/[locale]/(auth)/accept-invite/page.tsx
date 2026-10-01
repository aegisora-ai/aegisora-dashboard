import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Accept invitation" };

export default function AcceptInvitePage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <AuthForm
        mode="invite"
        title="Accept your invitation"
        description="Create your account to join the workspace."
        fields={[
          { name: "name", label: "Full name", type: "text", autoComplete: "name" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
        ]}
        submitLabel="Join workspace"
        redirectTo="/onboarding"
      />
    </div>
  );
}