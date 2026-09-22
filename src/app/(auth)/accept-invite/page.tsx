import type { Metadata } from "next";
import { AuthForm } from "@/components/aegisora/auth-form";

export const metadata: Metadata = { title: "Accept invitation" };

export default function AcceptInvitePage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <dl className="rounded-md border border-border bg-surface-2 px-4 py-3 text-sm">
        <div className="flex justify-between py-1"><dt className="text-muted-foreground">Workspace</dt><dd className="font-mono text-xs">demo-workspace</dd></div>
        <div className="flex justify-between py-1"><dt className="text-muted-foreground">Role</dt><dd className="font-mono text-xs">analyst</dd></div>
        <div className="flex justify-between py-1"><dt className="text-muted-foreground">Invitation</dt><dd className="font-mono text-xs">sample</dd></div>
      </dl>
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