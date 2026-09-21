import type { Metadata } from "next";
import { demoMembers, roleDescriptions } from "@/lib/demo-team";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Team" };

const roleTone: Record<string, string> = { OWNER: "text-cyan", ADMIN: "text-foreground", MEMBER: "text-muted-foreground", VIEWER: "text-muted-foreground" };
const statusTone: Record<string, string> = { ACTIVE: "text-allow", INVITED: "text-escalate", SUSPENDED: "text-block" };

export default function TeamPage() {
  const active = demoMembers.filter((m) => m.status === "ACTIVE").length;
  const invited = demoMembers.filter((m) => m.status === "INVITED").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">Members with access to this workspace.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">{active} ACTIVE &middot; {invited} INVITED</span>
      </header>

      <section aria-labelledby="roles-title">
        <h2 id="roles-title" className="mb-3 text-sm font-medium">Roles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roleDescriptions.map((r) => (
            <div key={r.role} className="aeg-panel p-4">
              <div className={cn("font-mono text-[11px] tracking-wider", roleTone[r.role])}>{r.label.toUpperCase()}</div>
              <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="members-title">
        <h2 id="members-title" className="mb-3 text-sm font-medium">Members</h2>
        <div className="aeg-panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {demoMembers.map((m) => (
                <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                  <td className="px-4 py-3 text-sm">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.email}</td>
                  <td className={cn("px-4 py-3 font-mono text-[11px] tracking-wider", roleTone[m.role])}>{m.role}</td>
                  <td className={cn("px-4 py-3 font-mono text-[11px] tracking-wider", statusTone[m.status])}>{m.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{m.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}