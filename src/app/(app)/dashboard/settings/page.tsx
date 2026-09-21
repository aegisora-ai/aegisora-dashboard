import type { Metadata } from "next";
import { account, apiKeys, notificationPreferences } from "@/lib/demo-settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account, API access, and notification preferences.</p>
      </header>

      <section aria-labelledby="account-title" className="aeg-panel p-5">
        <h2 id="account-title" className="text-sm font-medium">Account</h2>
        <dl className="mt-4 divide-y divide-border/60 border-t border-border">
          <div className="grid grid-cols-[140px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-sm">{account.name}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-mono text-xs">{account.email}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Timezone</dt>
            <dd className="font-mono text-xs">{account.timezone}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="keys-title">
        <h2 id="keys-title" className="mb-3 text-sm font-medium">API keys</h2>
        <div className="aeg-panel overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Key</th>
                <th className="px-4 py-3 font-medium">Scopes</th>
                <th className="px-4 py-3 font-medium">Last used</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((k) => (
                <tr key={k.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 text-sm">{k.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{k.prefix}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{k.scopes.join(", ")}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{k.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="notif-title" className="aeg-panel p-5">
        <h2 id="notif-title" className="text-sm font-medium">Notifications</h2>
        <ul className="mt-4 divide-y divide-border/60">
          {notificationPreferences.map((n) => (
            <li key={n.label} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div>{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.channel}</div>
              </div>
              <span className={cn("font-mono text-[11px] tracking-wider", n.enabled ? "text-allow" : "text-muted-foreground")}>
                {n.enabled ? "ON" : "OFF"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}