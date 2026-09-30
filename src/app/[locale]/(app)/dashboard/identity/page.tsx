import type { Metadata } from "next";
import { identityConfig } from "@/lib/demo-identity";
import { cn } from "@/lib/utils";
import { MfaSettings } from "@/components/aegisora/mfa-settings";

export const metadata: Metadata = { title: "Identity" };

export default function IdentityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Identity</h1>
        <p className="mt-1 text-sm text-muted-foreground">Authentication and access configuration for this workspace.</p>
      </header>

      <section aria-labelledby="sso-title" className="aeg-panel p-5">
        <div className="flex items-center justify-between">
          <h2 id="sso-title" className="text-sm font-medium">Single sign-on</h2>
          <span className={cn("font-mono text-[11px] tracking-wider", identityConfig.ssoConfigured ? "text-allow" : "text-muted-foreground")}>
            {identityConfig.ssoConfigured ? "CONFIGURED" : "NOT CONFIGURED"}
          </span>
        </div>
        <dl className="mt-4 divide-y divide-border/60 border-t border-border">
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Provider</dt>
            <dd className="font-mono text-xs">{identityConfig.ssoProvider}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">SCIM provisioning</dt>
            <dd className="font-mono text-xs">{identityConfig.scimEnabled ? "Enabled" : "Disabled"}</dd>
          </div>
        </dl>
      </section>

      <MfaSettings />

      <section aria-labelledby="session-title" className="aeg-panel p-5">
        <h2 id="session-title" className="text-sm font-medium">Session policy</h2>
        <dl className="mt-4 divide-y divide-border/60 border-t border-border">
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Session timeout</dt>
            <dd className="font-mono text-xs">{identityConfig.sessionTimeoutMinutes ? `${identityConfig.sessionTimeoutMinutes} minutes` : "Not verified against hosted Auth settings"}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Last security review</dt>
            <dd className="font-mono text-xs">{identityConfig.lastSecurityReview ?? "No completed review recorded"}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="domains-title" className="aeg-panel p-5">
        <h2 id="domains-title" className="text-sm font-medium">Allowed email domains</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {identityConfig.allowedDomains.length
            ? identityConfig.allowedDomains.map((d) => <span key={d} className="rounded-sm bg-surface-3 px-3 py-1.5 font-mono text-[11px]">{d}</span>)
            : <span className="text-xs text-muted-foreground">No domain restriction configured.</span>}
        </div>
      </section>
    </div>
  );
}
