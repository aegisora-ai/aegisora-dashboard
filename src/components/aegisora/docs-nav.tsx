'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type NavItem = { title: string; href: string };
export type NavGroup = { title: string; items: NavItem[] };

export const NAV_TREE: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quickstart', href: '/docs/quickstart' },
      { title: 'Policy Example', href: '/docs#example' },
      { title: 'Technical reference', href: '/docs/technical' },
    ],
  },
  {
    title: 'Architecture',
    items: [
      { title: 'Runtime Pipeline', href: '/docs#v3' },
      { title: 'Policies, decisions and evidence', href: '/docs/technical' },
    ],
  },
  {
    title: 'Version History',
    items: [
      { title: '1.0 - Foundation', href: '/docs#v1' },
      { title: '2.0 - Context & Risk', href: '/docs#v2' },
      { title: '3.0 - Enterprise Runtime', href: '/docs#v3' },
      { title: '4.0 - Current', href: '/docs#v4' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'Capability Matrix', href: '/docs#capability' },
      { title: 'API Contract', href: '/docs#api' },
    ],
  },
];

function NavGroupBlock({ group, defaultOpen }: { group: NavGroup; defaultOpen: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/60 pb-1 last:border-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2.5 text-left transition-colors hover:text-foreground"
      >
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {group.title}
        </span>
        <ChevronRight
          size={14}
          aria-hidden
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-300 ease-out',
            open && 'rotate-90'
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-0.5 pb-3 pl-1">
            {group.items.map((item) => {
              // Sadece sayfanin kendisi aktif sayilir; #anchor linkleri aktif olmaz.
              const active = !item.href.includes('#') && pathname === item.href;
              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function DocsNav() {
  return (
    <nav aria-label="Documentation" className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      {NAV_TREE.map((group, i) => (
        <NavGroupBlock key={group.title} group={group} defaultOpen={i < 2} />
      ))}
    </nav>
  );
}