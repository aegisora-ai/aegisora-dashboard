/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={"flex items-center shrink-0 cursor-pointer transition-opacity hover:opacity-85 " + className}
      title="Ana Sayfaya Dön"
    >
      <img
        src="/LOGO-icon-trimmed.png"
        alt="Aegisora Logo"
        className="h-6 md:h-7 w-auto object-contain"
      />
    </Link>
  );
}
