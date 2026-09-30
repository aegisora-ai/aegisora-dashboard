'use client';

import { Link } from '@/i18n/navigation';
import { NAV_TREE } from '@/components/aegisora/docs-nav';

export function DocsMegaMenu() {
  return (
    <div className="invisible absolute left-0 top-full z-[110] w-[92vw] max-w-[520px] translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="rounded-xl border border-[#1677ff]/20 bg-[#061022]/98 p-6 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          {NAV_TREE.map((group) => (
            <div key={group.title}>
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1677ff]">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-500">Full documentation, versioned and searchable.</p>
          <Link href="/docs" className="shrink-0 text-xs font-semibold text-[#1677ff] hover:underline">
            Open Docs &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}