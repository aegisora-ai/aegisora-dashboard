/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CONSENT_COOKIE = 'aegisora_cookie_consent';
const CONSENT_VALUE_ACCEPTED = 'accepted';
const CONSENT_VALUE_REJECTED = 'rejected';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getCookie(CONSENT_COOKIE);
    if (!existing) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  async function persist(value: 'accepted' | 'rejected') {
    setCookie(CONSENT_COOKIE, value, 365);
    setVisible(false);

    // Giris yapmis kullanici varsa tercihini Supabase'deki profiline de yaz,
    // ki baska cihazdan girince tekrar sorulmasin. Misafir kullanicida bu
    // adim atlanir - cookie zaten yeterli, backend zorunlu degil.
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ cookie_consent: value, cookie_consent_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch {
      // Profiles tablosunda bu kolon yoksa veya kullanici yoksa sessizce gec -
      // cookie zaten kaydedildi, kullanici deneyimi bozulmaz.
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-xl border border-border bg-surface-2/98 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="shrink-0 rounded-md bg-surface-3 p-2">
            <Cookie className="size-4 text-primary" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We use essential cookies to run this site and, with your consent, analytics cookies to improve it.
            See our{' '}
            <a href="/trust/privacy" className="text-foreground underline underline-offset-2 hover:text-primary">
              privacy policy
            </a>.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => persist(CONSENT_VALUE_REJECTED)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3"
          >
            Reject
          </button>
          <button
            onClick={() => persist(CONSENT_VALUE_ACCEPTED)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

