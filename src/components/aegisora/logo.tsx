/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

// Acik temada ikon orijinal renginde (mavi), yazi siyah. Dark temada orijinal logo.
// Ikon/yazi siniri: inset(0 67% 0 0) ve inset(0 0 0 33%). Sinir kayarsa iki yuzdeyi birlikte degistir.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={"flex items-center shrink-0 cursor-pointer transition-opacity hover:opacity-85 " + className}
      title="Aegisora"
    >
      <span className="relative inline-block">
        <img
          src="/LOGO-icon-trimmed-420.webp"
          width={420}
          height={89}
          alt="Aegisora Logo"
          className="block h-6 w-auto object-contain md:h-7 [clip-path:inset(0_67%_0_0)] dark:[clip-path:none]"
        />
        <img
          src="/LOGO-icon-trimmed-420.webp"
          width={420}
          height={89}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full object-contain brightness-0 [clip-path:inset(0_0_0_33%)] dark:hidden"
        />
      </span>
    </Link>
  );
}