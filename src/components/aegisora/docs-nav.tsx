'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type NavItem = { key?: string; title: string; href: string };
export type NavGroup = { key?: string; title: string; items: NavItem[] };

export const NAV_TREE: NavGroup[] = [
  {
    key: 'start',
    title: 'Getting Started',
    items: [
      { key: 'intro', title: 'Introduction', href: '/docs' },
      { key: 'quickstart', title: 'Quickstart', href: '/docs/quickstart' },
      { key: 'policyExample', title: 'Policy Example', href: '/docs#example' },
      { key: 'technical', title: 'Technical reference', href: '/docs/technical' },
    ],
  },
  {
    key: 'arch',
    title: 'Architecture',
    items: [
      { key: 'pipeline', title: 'Runtime Pipeline', href: '/docs#v3' },
      { key: 'pde', title: 'Policies, decisions and evidence', href: '/docs/technical' },
    ],
  },
  {
    key: 'versions',
    title: 'Version History',
    items: [
      { key: 'v1', title: '1.0 - Foundation', href: '/docs#v1' },
      { key: 'v2', title: '2.0 - Context & Risk', href: '/docs#v2' },
      { key: 'v3', title: '3.0 - Enterprise Runtime', href: '/docs#v3' },
      { key: 'v4', title: '4.0 - Current', href: '/docs#v4' },
    ],
  },
  {
    key: 'ref',
    title: 'Reference',
    items: [
      { key: 'capability', title: 'Capability Matrix', href: '/docs#capability' },
      { key: 'api', title: 'API Contract', href: '/docs#api' },
    ],
  },
];

function NavGroupBlock({ group, defaultOpen }: { group: NavGroup; defaultOpen: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('Docs');
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
          {group.key ? t('groups.' + group.key) : group.title}
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
              // Only the page itself counts as active; #anchor links never do.
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
                    {item.key ? t('items.' + item.key) : item.title}
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
  const t = useTranslations('Docs');
  return (
    <nav aria-label={t('aria')} className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
      {NAV_TREE.map((group, i) => (
        <NavGroupBlock key={group.title} group={group} defaultOpen={i < 2} />
      ))}
    </nav>
  );
}