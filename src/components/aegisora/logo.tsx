/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={"flex items-center shrink-0 cursor-pointer transition-opacity hover:opacity-85 " + className}
      title="Aegisora"
    >
      <img
        src="/LOGO-icon-trimmed-420.webp"
        width={420}
        height={89}
        alt="Aegisora Logo"
        className="h-6 w-auto object-contain brightness-0 md:h-7 dark:brightness-100"
      />
    </Link>
  );
}