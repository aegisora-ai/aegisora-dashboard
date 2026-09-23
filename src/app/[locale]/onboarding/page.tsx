import React from 'react';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/aegisora/logo';

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020611] px-4">
      <Logo className="mb-8" />
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#061022]/80 p-12 shadow-2xl text-center backdrop-blur-xl">
        <h1 className="text-4xl font-extrabold text-white">Welcome to Aegisora</h1>
        <p className="mt-4 text-lg text-slate-400">You're one step away from securing your AI agents. Let's set up your first workspace and connect your runtime.</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="rounded-lg bg-[#1677ff] px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-[#0b6fb5] transition-all">
            Go to Dashboard
          </Link>
          <Link href="/docs" className="rounded-lg border border-slate-700 bg-transparent px-8 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all">
            Read the Docs
          </Link>
        </div>
      </div>
    </div>
  );
}