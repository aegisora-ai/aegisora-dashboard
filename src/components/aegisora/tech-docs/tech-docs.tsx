"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  DOC_VERSION,
  GROUPS,
  PIPELINE,
  SECTIONS,
  type Block,
  type DocSection,
  type PipelineStep,
} from "./data";

const THEME = { "--td-bg": "transparent", "--td-panel": "color-mix(in srgb, var(--foreground) 5%, transparent)", "--td-panel-2": "color-mix(in srgb, var(--foreground) 8%, transparent)", "--td-line": "color-mix(in srgb, var(--foreground) 14%, transparent)", "--td-text": "var(--foreground)", "--td-muted": "color-mix(in srgb, var(--foreground) 62%, transparent)", "--td-accent": "var(--primary)", "--td-accent-2": "var(--primary)" } as CSSProperties;

function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") && p.length > 2 ? (
          <code
            key={i}
            className="rounded bg-[var(--td-line)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--td-accent-2)]"
          >
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function CodeBlock({ title, code }: { title?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--td-line)] bg-[var(--td-panel-2)]">
      <div className="flex items-center justify-between border-b border-[var(--td-line)] px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--td-muted)]">
          {title ?? "Reference"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-[var(--td-line)] px-2 py-1 text-xs text-[var(--td-muted)] transition hover:border-[var(--td-accent)] hover:text-[var(--td-text)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-[var(--td-text)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Pipeline() {
  const start = Math.max(
    0,
    PIPELINE.findIndex((s) => s.name === "CONTINUITY SEAL"),
  );
  const [sel, setSel] = useState(start);
  const step: PipelineStep = PIPELINE.find((_, i) => i === sel) ?? (PIPELINE[0] as PipelineStep);
  return (
    <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
      <ol className="space-y-1">
        {PIPELINE.map((s, i) => (
          <li key={s.name}>
            <button
              type="button"
              onClick={() => setSel(i)}
              aria-pressed={i === sel}
              className={
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition " +
                (i === sel
                  ? "border-[var(--td-accent)] bg-[var(--td-accent)]/10 text-[var(--td-text)]"
                  : "border-transparent text-[var(--td-muted)] hover:bg-[var(--td-panel-2)] hover:text-[var(--td-text)]")
              }
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] font-mono text-[11px]">
                {i + 1}
              </span>
              <span className="flex-1 font-medium tracking-wide">{s.name}</span>
              {s.since ? (
                <span className="rounded-full bg-[var(--td-accent)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--td-accent)]">
                  {s.since}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border border-[var(--td-line)] bg-[var(--td-panel)] p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-[var(--td-muted)]">
            Stage {sel + 1} of {PIPELINE.length}
          </span>
          {step.since ? (
            <span className="rounded-full bg-[var(--td-accent)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--td-accent)]">
              Introduced in {step.since}
            </span>
          ) : null}
        </div>
        <h4 className="mt-3 text-xl font-semibold tracking-wide text-[var(--td-text)]">{step.name}</h4>
        <p className="mt-2 text-[var(--td-text)]/90">{step.summary}</p>
        <ul className="mt-5 space-y-2.5">
          {step.details.map((d) => (
            <li key={d} className="flex gap-3 text-sm leading-relaxed text-[var(--td-muted)]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--td-accent-2)]" />
              <span>
                <Inline text={d} />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between border-t border-[var(--td-line)] pt-4 text-sm">
          <button
            type="button"
            disabled={sel === 0}
            onClick={() => setSel((v) => Math.max(0, v - 1))}
            className="text-[var(--td-muted)] transition hover:text-[var(--td-text)] disabled:opacity-30"
          >
            Previous stage
          </button>
          <button
            type="button"
            disabled={sel === PIPELINE.length - 1}
            onClick={() => setSel((v) => Math.min(PIPELINE.length - 1, v + 1))}
            className="text-[var(--td-accent)] transition hover:text-[var(--td-text)] disabled:opacity-30"
          >
            Next stage
          </button>
        </div>
      </div>
    </div>
  );
}

const TONES: Record<"info" | "security" | "new", { box: string; label: string }> = {
  info: { box: "border-sky-500/40 bg-sky-500/[0.08]", label: "text-sky-600" },
  security: { box: "border-emerald-500/40 bg-emerald-500/[0.08]", label: "text-emerald-600" },
  new: { box: "border-[var(--td-accent)]/35 bg-[var(--td-accent)]/10", label: "text-[var(--td-accent)]" },
};

function BlockView({ b }: { b: Block }): ReactNode {
  switch (b.t) {
    case "p":
      return (
        <p className="leading-relaxed text-[var(--td-muted)]">
          <Inline text={b.text} />
        </p>
      );
    case "h3":
      return (
        <h3 id={b.id} className="scroll-mt-28 pt-4 text-lg font-semibold text-[var(--td-text)]">
          {b.text}
        </h3>
      );
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className="space-y-2">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3 leading-relaxed text-[var(--td-muted)]">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--td-accent)]" />
              <span>
                <Inline text={it} />
              </span>
            </li>
          ))}
        </Tag>
      );
    }
    case "code":
      return <CodeBlock title={b.title} code={b.code} />;
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-[var(--td-line)]">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[var(--td-panel-2)]">
                {b.head.map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--td-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-[var(--td-line)]">
                  {r.map((c, j) => (
                    <td
                      key={j}
                      className={"px-4 py-3 align-top " + (j === 0 ? "font-medium text-[var(--td-text)]" : "text-[var(--td-muted)]")}
                    >
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const tone = TONES[b.tone];
      return (
        <div className={"rounded-xl border p-4 " + tone.box}>
          <div className={"text-xs font-semibold uppercase tracking-wider " + tone.label}>{b.title}</div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--td-text)]/90">
            <Inline text={b.text} />
          </p>
        </div>
      );
    }
    case "cards":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {b.items.map((c) => (
            <div key={c.title} className="rounded-xl border border-[var(--td-line)] bg-[var(--td-panel)] p-5">
              {c.tag ? (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--td-accent-2)]">{c.tag}</span>
              ) : null}
              <div className="mt-1 font-semibold text-[var(--td-text)]">{c.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--td-muted)]">
                <Inline text={c.text} />
              </p>
            </div>
          ))}
        </div>
      );
    case "pipeline":
      return <Pipeline />;
    default:
      return null;
  }
}

function matches(s: DocSection, q: string): boolean {
  if (!q) return true;
  return (s.title + " " + s.keywords + " " + s.lead).toLowerCase().includes(q.toLowerCase());
}

export function TechDocs() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(SECTIONS[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => e !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = vis[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const visible = useMemo(() => SECTIONS.filter((s) => matches(s, query)), [query]);
  const activeSection = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const toc = (activeSection?.blocks ?? []).filter((b): b is Extract<Block, { t: "h3" }> => b.t === "h3");

  const nav = (
    <nav aria-label="Technical documentation" className="space-y-6">
      <div>
        <label htmlFor="td-search" className="sr-only">
          Search documentation
        </label>
        <input
          id="td-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics"
          className="w-full rounded-lg border border-[var(--td-line)] bg-[var(--td-panel)] px-3 py-2 text-sm text-[var(--td-text)] placeholder:text-[var(--td-muted)] focus:border-[var(--td-accent)] focus:outline-none"
        />
      </div>
      {GROUPS.map((g) => {
        const items = visible.filter((s) => s.group === g);
        if (items.length === 0) return null;
        return (
          <div key={g}>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--td-muted)]">{g}</div>
            <ul className="space-y-0.5">
              {items.map((s) => (
                <li key={s.id}>
                  <a
                    href={"#" + s.id}
                    onClick={() => setOpen(false)}
                    className={
                      "block rounded-md border-l-2 px-3 py-1.5 text-sm transition " +
                      (active === s.id
                        ? "border-[var(--td-accent)] bg-[var(--td-accent)]/10 text-[var(--td-text)]"
                        : "border-transparent text-[var(--td-muted)] hover:text-[var(--td-text)]")
                    }
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {visible.length === 0 ? <p className="text-sm text-[var(--td-muted)]">No topics match your search.</p> : null}
    </nav>
  );

  return (
    <div style={THEME} className="bg-[var(--td-bg)] text-[var(--td-text)]">
      <header className="relative overflow-hidden border-b border-[var(--td-line)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 80% at 15% 0%, rgba(109,155,255,0.22), transparent 60%), radial-gradient(40% 60% at 90% 10%, rgba(56,189,248,0.14), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[var(--td-line)] bg-[var(--td-panel)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--td-accent-2)]">
              Technical documentation
            </span>
            <span className="rounded-full bg-[var(--td-accent)]/15 px-3 py-1 text-xs font-semibold text-[var(--td-accent)]">
              Runtime {DOC_VERSION}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--td-text)] sm:text-5xl">
            Aegisora runtime reference
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--td-muted)]">
            How Aegisora governs autonomous AI agents: the decision pipeline, canonical authority, execution continuity,
            evidence and enterprise controls.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://github.com/aegisora-ai/aegisora"
              className="rounded-lg bg-[var(--td-accent)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground,#fff)] transition hover:brightness-110"
            >
              Core repository
            </a>
            <a
              href="https://github.com/aegisora-ai/aegisora/releases"
              className="rounded-lg border border-[var(--td-line)] px-4 py-2 text-sm font-medium text-[var(--td-text)] transition hover:border-[var(--td-accent)]"
            >
              Release notes
            </a>
            <a
              href="https://docs.aegisora.org/"
              className="rounded-lg border border-[var(--td-line)] px-4 py-2 text-sm font-medium text-[var(--td-text)] transition hover:border-[var(--td-accent)]"
            >
              docs.aegisora.org
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--td-line)] bg-[var(--td-line)] sm:grid-cols-4">
            {[
              ["12", "pipeline stages"],
              ["3", "decisions: ALLOW, BLOCK, ESCALATE"],
              ["9", "aligned packages (v2.0)"],
              ["115/115", "runtime tests (v4.0.0 notes)"],
            ].map(([v, l]) => (
              <div key={l} className="bg-[var(--td-bg)] p-4">
                <dt className="text-2xl font-semibold text-[var(--td-text)]">{v}</dt>
                <dd className="mt-1 text-xs text-[var(--td-muted)]">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_200px]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-[var(--td-line)] px-3 py-2 text-sm text-[var(--td-text)] lg:hidden"
          aria-expanded={open}
        >
          {open ? "Hide contents" : "Show contents"}
        </button>
        <aside className={(open ? "block" : "hidden") + " lg:block"}>
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">{nav}</div>
        </aside>

        <main className="min-w-0 space-y-16">
          {visible.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--td-accent-2)]">{s.group}</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--td-text)]">{s.title}</h2>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--td-text)]/90">{s.lead}</p>
              <div className="mt-6 space-y-5">
                {s.blocks.map((b, i) => (
                  <BlockView key={i} b={b} />
                ))}
              </div>
            </section>
          ))}
          <footer className="border-t border-[var(--td-line)] pt-8 text-sm text-[var(--td-muted)]">
            <p>
              This reference is derived from the published Aegisora release notes through {DOC_VERSION} and the public
              documentation at docs.aegisora.org. Exact APIs and runnable code live in the core repository.
            </p>
            <p className="mt-3">
              <a className="text-[var(--td-accent)] hover:underline" href="https://github.com/aegisora-ai/aegisora/blob/main/SECURITY.md">
                Security policy
              </a>
              {" \u00b7 "}
              <a className="text-[var(--td-accent)] hover:underline" href="https://github.com/aegisora-ai/aegisora/blob/main/CONTRIBUTING.md">
                Contributing
              </a>
            </p>
          </footer>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-24">
            {toc.length > 0 ? (
              <>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--td-muted)]">On this page</div>
                <ul className="space-y-1.5 border-l border-[var(--td-line)] pl-3">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={"#" + t.id} className="text-sm text-[var(--td-muted)] transition hover:text-[var(--td-text)]">
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}