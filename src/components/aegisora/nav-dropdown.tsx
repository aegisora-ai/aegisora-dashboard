'use client';

import { Link } from '@/i18n/navigation';

export type DropdownItem = { title: string; href: string; desc?: string };

export function NavDropdown({ items }: { items: DropdownItem[] }) {
  return (
    <div className="invisible absolute left-0 top-full z-[110] w-[280px] translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="rounded-xl border border-[#1677ff]/20 bg-[#061022]/98 p-3 shadow-2xl shadow-black/50 backdrop-blur-md">
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg px-3 py-2 transition-colors hover:bg-[#1677ff]/10"
              >
                <span className="block text-sm font-medium text-slate-200">{item.title}</span>
                {item.desc && <span className="mt-0.5 block text-xs text-slate-500">{item.desc}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}