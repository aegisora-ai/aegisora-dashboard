import type { Metadata } from "next";
import { workspace } from "@/lib/demo-workspace";

export const metadata: Metadata = { title: "Workspace" };

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">General configuration for this workspace.</p>
      </header>

      <section aria-labelledby="general-title" className="aeg-panel p-5">
        <h2 id="general-title" className="text-sm font-medium">General</h2>
        <dl className="mt-4 divide-y divide-border/60 border-t border-border">
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-sm">{workspace.name}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{workspace.slug}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Region</dt>
            <dd className="font-mono text-xs">{workspace.region}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-mono text-xs">{workspace.createdAt}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Default decision mode</dt>
            <dd className="font-mono text-xs">{workspace.defaultDecisionMode}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="env-title" className="aeg-panel p-5">
        <h2 id="env-title" className="text-sm font-medium">Environments</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {workspace.environments.map((e) => (
            <span key={e} className="rounded-sm bg-surface-3 px-3 py-1.5 font-mono text-[11px]">{e}</span>
          ))}
        </div>
      </section>

      <section aria-labelledby="retention-title" className="aeg-panel p-5">
        <h2 id="retention-title" className="text-sm font-medium">Retention</h2>
        <dl className="mt-4 divide-y divide-border/60 border-t border-border">
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Runtime data</dt>
            <dd className="font-mono text-xs">{workspace.dataRetentionDays} days</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Evidence records</dt>
            <dd className="font-mono text-xs">{workspace.evidenceRetentionDays} days</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="danger-title" className="rounded-sm border border-block/40 bg-block/5 p-5">
        <h2 id="danger-title" className="text-sm font-medium text-block">Danger zone</h2>
        <p className="mt-2 text-xs text-muted-foreground">Deleting this workspace permanently removes all agents, policies, and evidence records.</p>
        <button type="button" disabled className="mt-4 cursor-not-allowed rounded-sm border border-block/40 px-3 py-1.5 font-mono text-[11px] text-block opacity-60">
          DELETE WORKSPACE (DISABLED IN DEMO)
        </button>
      </section>
    </div>
  );
}