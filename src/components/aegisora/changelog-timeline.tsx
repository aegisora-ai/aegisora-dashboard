import { Check } from "lucide-react";
import { RELEASES, REPO_URL, type Release } from "@/lib/releases";
import { cn } from "@/lib/utils";

const anchor = (v: string) => "v" + v.replace(/\./g, "-");

function Chain({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{label.toUpperCase()}</div>
      <ol className="mt-2 flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="rounded-sm border border-border bg-surface-3 px-2 py-1 font-mono text-[11px] text-foreground">{s}</span>
            {i < steps.length - 1 && <span aria-hidden="true" className="text-muted-foreground">&rarr;</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ReleaseCard({ r, latest }: { r: Release; latest: boolean }) {
  return (
    <article id={anchor(r.version)} className="scroll-mt-24 border-b border-border pb-14 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-sm border border-cyan/40 bg-surface-3 px-2 py-0.5 font-mono text-xs text-cyan">v{r.version}</span>
        {r.kind && (
          <span className={cn(
            "rounded-sm px-2 py-0.5 font-mono text-[10px] tracking-wider",
            latest ? "bg-cyan/15 text-cyan" : "bg-surface-4 text-muted-foreground",
          )}>
            {r.kind.toUpperCase()}
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {REPO_URL ? (
            <a href={`${REPO_URL}/commit/${r.commit}`} target="_blank" rel="noreferrer" className="hover:text-foreground">
              tag v{r.version} &middot; {r.commit}
            </a>
          ) : (
            <>tag v{r.version} &middot; {r.commit}</>
          )}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{r.title}</h2>
      <p className="mt-3 max-w-3xl text-muted-foreground">{r.summary}</p>
      {r.tagline && (
        <p className="mt-5 border-l-2 border-cyan pl-4 text-lg font-medium text-foreground">{r.tagline}</p>
      )}

      {r.chains && (
        <div className="mt-8 space-y-5 rounded-md border border-border bg-surface-1 p-5">
          {r.chains.map((c) => <Chain key={c.label} {...c} />)}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {r.sections.map((s) => (
          <section key={s.title} className="rounded-md border border-border bg-surface-1 p-5">
            <h3 className="text-sm font-semibold">{s.title}</h3>
            {s.body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>}
            {s.items && (
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {s.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-cyan" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {r.validation && (
        <div className="mt-6 rounded-md border border-border bg-surface-1 p-5">
          <h3 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">VALIDATION</h3>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            {r.validation.map((v) => (
              <li key={v} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-allow" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.next && (
        <p className="mt-6 text-sm text-muted-foreground">
          <span className="font-mono text-[10px] tracking-[0.2em]">WHAT CAME NEXT</span>
          <br />
          {r.next}
        </p>
      )}
    </article>
  );
}

export function ChangelogTimeline() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <header className="max-w-3xl">
        <div className="font-mono text-[11px] tracking-[0.25em] text-cyan">CHANGELOG</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Every release, from foundation to enterprise runtime.</h1>
        <p className="mt-4 text-muted-foreground">
          Aegisora enforces governance before execution. Each release below builds on the last: evidence, canonical authority, governance boundary, runtime hardening, platform, enterprise runtime.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Releases" className="sticky top-24">
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">RELEASES</div>
            <ul className="mt-3 space-y-1 border-l border-border">
              {RELEASES.map((r) => (
                <li key={r.version}>
                  <a href={`#${anchor(r.version)}`} className="-ml-px block border-l border-transparent py-1 pl-3 font-mono text-xs text-muted-foreground hover:border-cyan hover:text-foreground">
                    v{r.version}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="space-y-14">
          {RELEASES.map((r, i) => <ReleaseCard key={r.version} r={r} latest={i === 0} />)}
        </div>
      </div>
    </div>
  );
}