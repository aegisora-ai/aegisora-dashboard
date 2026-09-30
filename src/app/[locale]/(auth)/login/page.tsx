'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/aegisora/logo';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    const form = new FormData(e.currentTarget);

    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    console.log('[AEGISORA LOGIN] submit:start');
    console.log('[AEGISORA LOGIN] email:', email);
    console.log('[AEGISORA LOGIN] before:createClient');

    try {
      const supabase = createClient();

      console.log('[AEGISORA LOGIN] after:createClient');
      console.log('[AEGISORA LOGIN] before:signInWithPassword');

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log('[AEGISORA LOGIN] after:signInWithPassword');

      if (authError) {
        console.error('[AEGISORA LOGIN] auth:error', authError);
        throw authError;
      }

      console.log('[AEGISORA LOGIN] auth:success');
      console.log('[AEGISORA LOGIN] navigating:/dashboard');

      router.push('/dashboard');
        router.refresh();
    } catch (err) {

      console.error('[AEGISORA LOGIN] fatal:error', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.'
      );

      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-[#061022]/80 p-10 shadow-2xl backdrop-blur-xl">

      <div className="flex flex-col items-center justify-center lg:hidden mb-8">
        <Logo />
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white">
          Sign in to workspace
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Or{' '}
          <Link
            href="/signup"
            className="text-[#1677ff] hover:underline"
          >
            create a new account
          </Link>
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <form
        className="mt-8 space-y-6"
        onSubmit={handleLogin}
      >
        <div className="space-y-4">

          <div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              className="relative block w-full rounded-lg border border-slate-700 bg-[#09162e] px-4 py-3 text-white placeholder-slate-500 focus:border-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff] sm:text-sm disabled:opacity-60"
              placeholder="Email address"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isLoading}
              className="relative block w-full rounded-lg border border-slate-700 bg-[#09162e] px-4 py-3 text-white placeholder-slate-500 focus:border-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff] sm:text-sm disabled:opacity-60"
              placeholder="Password"
            />
          </div>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-700 bg-[#09162e] text-[#1677ff] focus:ring-[#1677ff]"
            />

            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-slate-400"
            >
              Remember me
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#1677ff] hover:text-[#0b6fb5]"
          >
            Forgot your password?
          </Link>

        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-lg bg-[#1677ff] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b6fb5] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Authenticating...' : 'Sign in'}
        </button>

      </form>
    </div>
  );
}


