/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

// Yeni marka isareti (public/logo-mark.png) + metin. Metin rengi temadan gelir.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={"flex items-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-85 " + className}
      title="Aegisora"
    >
      <img
        src="/logo-mark.png"
        width={40}
        height={28}
        alt=""
        aria-hidden="true"
        className="block h-6 w-auto md:h-7"
      />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">Aegisora</span>
    </Link>
  );
}