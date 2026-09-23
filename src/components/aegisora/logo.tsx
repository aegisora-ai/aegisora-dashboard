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
        src="/LOGO-icon.png" 
        alt="Aegisora Logo" 
        className="h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-md"
      />
    </Link>
  );
}
