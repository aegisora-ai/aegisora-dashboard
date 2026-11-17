"use client";

import { useEffect, useMemo, useState } from "react";
import { CATALOG, KIND_META } from "./catalog";
import type { Decision, ExtensionItem, ExtensionKind } from "./types";

const STORAGE_KEY = "aegisora.extensions.v1";

type Enabled = Record<string, boolean>;

const DECISION_STYLE: Record<Decision, string> = {
  ALLOW: "bg-emerald-500/15 text-emerald-500",
  ESCALATE: "bg-amber-500/15 text-amber-500",
  BLOCK: "bg-red-500/15 text-red-500",
};

function readEnabled(): Enabled {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Enabled) : {};
  } catch {
    return {};
  }
}

function writeEnabled(value: Enabled): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // storage unavailable: selection stays in memory only
  }
}

function buildConfig(enabled: Enabled) {
  const on = CATALOG.filter((item) => enabled[item.id]);
  const ids = (kind: ExtensionKind) =>
    on.filter((item) => item.kind === kind).map((item) => item.id);

  return {
    version: "4.5",
    generatedAt: new Date().toISOString(),
    connectors: ids("connectors"),
    presets: ids("presets"),
    skills: ids("skills"),
    rules: on
      .filter((item) => item.kind === "presets")
      .flatMap((item) =>
        (item.rules ?? []).map((rule) => ({ preset: item.id, ...rule })),
      ),
  };
}

export function ExtensionHub({ kind }: { kind: ExtensionKind }) {
  const meta = KIND_META[kind];
  const [enabled, setEnabled] = useState<Enabled>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    setEnabled(readEnabled());
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter(
      (item) =>
        item.kind === kind &&
        (q === "" ||
          `${item.name} ${item.description} ${item.category}`
            .toLowerCase()
            .includes(q)),
    );
  }, [kind, query]);

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  const toggle = (item: ExtensionItem) => {
    if (item.status !== "ready") return;
    const next = { ...enabled, [item.id]: !enabled[item.id] };
    setEnabled(next);
    writeEnabled(next);
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(buildConfig(enabled), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aegisora.config.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <p className="mt-1 max-w-2xl text-sm opacity-70">{meta.subtitle}</p>
      </div>

      <div className="rounded-lg border border-current/15 bg-current/[0.04] px-4 py-3 text-sm opacity-80">
        Your selections are saved on this device and exported as{" "}
        <code>aegisora.config.json</code>. Live sync with the runtime is the
        next step. Items marked Preview are on the roadmap and cannot be enabled
        yet.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${meta.title.toLowerCase()}...`}
          className="h-9 w-full max-w-xs rounded-md border border-current/20 bg-transparent px-3 text-sm outline-none focus:border-blue-500"
        />
        <span className="text-sm opacity-70">{enabledCount} enabled in total</span>
        <button
          type="button"
          onClick={exportConfig}
          className="ml-auto h-9 rounded-md border border-current/20 px-3 text-sm font-medium hover:bg-current/10"
        >
          Export config
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm opacity-60">{meta.empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const isOn = Boolean(enabled[item.id]);
            const isReady = item.status === "ready";
            return (
              <article
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-current/15 bg-current/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{item.name}</h2>
                    <p className="text-xs opacity-60">{item.category}</p>
                  </div>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[11px] font-medium " +
                      (isReady
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-amber-500/15 text-amber-500")
                    }
                  >
                    {isReady ? "Ready" : "Preview"}
                  </span>
                </div>

                <p className="text-sm opacity-80">{item.description}</p>

                {item.rules && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.rules.map((rule) => (
                      <span
                        key={rule.action}
                        className={
                          "rounded px-1.5 py-0.5 font-mono text-[11px] " +
                          DECISION_STYLE[rule.decision]
                        }
                      >
                        {rule.action} · {rule.decision}
                      </span>
                    ))}
                  </div>
                )}

                {item.setup && <p className="text-xs opacity-60">{item.setup}</p>}

                <div className="mt-auto pt-2">
                  <button
                    type="button"
                    disabled={!isReady}
                    onClick={() => toggle(item)}
                    className={
                      "h-9 w-full rounded-md text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 " +
                      (!isReady
                        ? "border border-current/20"
                        : isOn
                          ? "border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                          : "bg-blue-600 text-white hover:bg-blue-500")
                    }
                  >
                    {!isReady ? "Coming soon" : isOn ? "Enabled" : "Enable"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}