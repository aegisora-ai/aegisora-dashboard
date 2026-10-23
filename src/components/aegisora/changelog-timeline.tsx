import { Check } from "lucide-react";
import { RELEASES, REPO_URL, type Release } from "@/lib/releases";
import { cn } from "@/lib/utils";

const anchor = (v: string) => "v" + v.replace(/\./g, "-");

const CARD = "rounded-2xl border border-white/10 bg-white/[0.04]";
const LABEL = "font-mono text-[10px] tracking-[0.2em] text-white/50";

function Chain({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div>
      <div className={LABEL}>{label.toUpperCase()}</div>
      <ol className="mt-2 flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 font-mono text-[11px] text-white">{s}</span>
            {i < steps.length - 1 && <span aria-hidden="true" className="text-white/40">&rarr;</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ReleaseCard({ r, latest }: { r: Release; latest: boolean }) {
  return (
    <article id={anchor(r.version)} className="scroll-mt-24 border-b border-white/10 pb-14 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-sky-400/40 bg-white/[0.06] px-2 py-0.5 font-mono text-xs text-sky-300">v{r.version}</span>
        {r.kind && (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider",
              latest ? "bg-sky-400/15 text-sky-300" : "bg-white/10 text-white/60",
            )}
          >
            {r.kind.toUpperCase()}
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] text-white/50">
          {REPO_URL ? (
            <a href={`${REPO_URL}/commit/${r.commit}`} target="_blank" rel="noreferrer" className="hover:text-white">
              tag v{r.version} &middot; {r.commit}
            </a>
          ) : (
            <>tag v{r.version} &middot; {r.commit}</>
          )}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{r.title}</h2>
      <p className="mt-3 max-w-3xl leading-relaxed text-white/70">{r.summary}</p>
      {r.tagline && (
        <p className="mt-5 border-l-2 border-sky-400 pl-4 text-lg font-medium text-white">{r.tagline}</p>
      )}

      {r.chains && (
        <div className={CARD + " mt-8 space-y-5 p-5"}>
          {r.chains.map((c) => <Chain key={c.label} {...c} />)}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {r.sections.map((s) => (
          <section key={s.title} className={CARD + " p-5"}>
            <h3 className="text-sm font-semibold">{s.title}</h3>
            {s.body && <p className="mt-2 text-sm leading-relaxed text-white/70">{s.body}</p>}
            {s.items && (
              <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                {s.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-sky-400" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {r.validation && (
        <div className={CARD + " mt-6 p-5"}>
          <h3 className={LABEL}>VALIDATION</h3>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-white/70 sm:grid-cols-2">
            {r.validation.map((v) => (
              <li key={v} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.next && (
        <p className="mt-6 text-sm text-white/70">
          <span className={LABEL}>WHAT CAME NEXT</span>
          <br />
          {r.next}
        </p>
      )}
    </article>
  );
}

export function ChangelogTimeline() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-24">
      <header className="max-w-3xl">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-sky-300">Changelog</div>
        <h1 className="mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-5xl">
          Every release, from foundation to enterprise runtime.
        </h1>
        <p className="mt-5 leading-relaxed text-white/70">
          Aegisora enforces governance before execution. Each release below builds on the last: evidence, canonical authority, governance boundary, runtime hardening, platform, enterprise runtime.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Releases" className="sticky top-24">
            <div className={LABEL}>RELEASES</div>
            <ul className="mt-3 space-y-1 border-l border-white/10">
              {RELEASES.map((r) => (
                <li key={r.version}>
                  <a
                    href={`#${anchor(r.version)}`}
                    className="-ml-px block border-l border-transparent py-1 pl-3 font-mono text-xs text-white/60 hover:border-sky-400 hover:text-white"
                  >
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