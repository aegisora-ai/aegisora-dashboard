"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { activeGroup } from "@/lib/aegisora/nav";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function SectionTabs() {
  const pathname = usePathname();
  const group = activeGroup(pathname);
  if (!group?.tabs) return null;
  return (
    <nav aria-label={group.label + " sections"} className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-1 pb-1">
      {group.tabs.map((t) => {
        const on = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              on ? "border-primary/40 bg-primary/12 text-primary" : "border-transparent text-muted-foreground hover:bg-surface-3 hover:text-foreground",
              focusRing,
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}