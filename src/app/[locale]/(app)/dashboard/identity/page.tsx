import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { MfaSettings } from "@/components/aegisora/mfa-settings";
import { PageHeader, Panel } from "@/components/aegisora/live/ui";

export const metadata: Metadata = { title: "Identity" };

export default function IdentityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Identity" description="Sign-in security for your account and this workspace." />

      <MfaSettings />

      <Panel>
        <h2 className="text-sm font-semibold">Enterprise identity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Single sign-on, SCIM provisioning and email-domain restrictions are not self-service yet.
          If your pilot needs them, tell us and we will set them up with you.
        </p>
        <Link href="/pilot" className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline">
          Talk to the team
        </Link>
      </Panel>
    </div>
  );
}