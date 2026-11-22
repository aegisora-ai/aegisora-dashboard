"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

export function DocsFrame({ menu, nav, children }: { menu: string; nav: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  // The technical reference has its own sidebar, so it renders full width.
  if (pathname === "/docs/technical") return <>{children}</>;
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 text-foreground sm:px-6 md:py-16">
      <details className="mb-8 rounded-xl border border-border bg-surface-1 px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold">{menu}</summary>
        <div className="mt-3">{nav}</div>
      </details>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}