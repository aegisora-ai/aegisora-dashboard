"use client";

import { useEffect, useRef, useState } from "react";
import { btnGhost } from "@/components/aegisora/live/ui";
import { cn } from "@/lib/utils";

type ConfirmOptions = { title: string; body?: string; confirmLabel?: string; danger?: boolean };
type ConfirmRequest = ConfirmOptions & { resolve: (value: boolean) => void };
type Toast = { id: number; text: string; ok: boolean };
type Listener = { onConfirm: (request: ConfirmRequest) => void; onToast: (toast: Toast) => void };

let listener: Listener | null = null;
let seq = 0;

/** Replaces window.confirm. Resolves true only when the person confirms. */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(false);
      return;
    }
    listener.onConfirm({ ...options, resolve });
  });
}

/** Replaces window.alert. Shows a short message in the corner. */
export function notify(text: string, ok = true) {
  listener?.onToast({ id: ++seq, text, ok });
}

export function FeedbackHost() {
  const [req, setReq] = useState<ConfirmRequest | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const active = useRef<ConfirmRequest | null>(null);
  const pending = useRef<ConfirmRequest[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    listener = {
      onConfirm: (request) => {
        if (active.current) {
          pending.current.push(request);
        } else {
          active.current = request;
          setReq(request);
        }
      },
      onToast: (toast) => {
        setToasts((list) => [...list.slice(-2), toast]);
        window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== toast.id)), toast.ok ? 4000 : 7000);
      },
    };
    return () => {
      listener = null;
    };
  }, []);

  function answer(value: boolean) {
    const current = active.current;
    if (!current) return;
    current.resolve(value);
    const next = pending.current.shift() ?? null;
    active.current = next;
    setReq(next);
  }

  useEffect(() => {
    if (!req) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const current = active.current;
        if (!current) return;
        current.resolve(false);
        const next = pending.current.shift() ?? null;
        active.current = next;
        setReq(next);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [req]);

  return (
    <>
      {req && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="fb-title" aria-describedby={req.body ? "fb-body" : undefined}>
          <div className="absolute inset-0 bg-black/60" onClick={() => answer(false)} aria-hidden="true" />
          <div className="aeg-panel relative w-full max-w-sm bg-popover p-5">
            <h2 id="fb-title" className="text-base font-semibold">{req.title}</h2>
            {req.body ? <p id="fb-body" className="mt-2 text-sm text-muted-foreground">{req.body}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button ref={cancelRef} type="button" onClick={() => answer(false)} className={btnGhost}>Cancel</button>
              <button
                type="button"
                onClick={() => answer(true)}
                className={cn(
                  "inline-flex h-8 items-center rounded-sm px-3 text-xs font-medium",
                  req.danger ? "bg-block text-white hover:opacity-90" : "bg-primary text-primary-foreground hover:bg-primary-hover",
                )}
              >
                {req.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[85] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
        {toasts.map((t) => (
          <p
            key={t.id}
            role={t.ok ? "status" : "alert"}
            className={cn(
              "pointer-events-auto max-w-sm rounded-md border bg-popover px-4 py-2.5 text-sm shadow-lg",
              t.ok ? "border-allow/40 text-allow" : "border-block/40 text-block",
            )}
          >
            {t.text}
          </p>
        ))}
      </div>
    </>
  );
}