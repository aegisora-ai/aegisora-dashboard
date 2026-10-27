'use client';

import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Bilgilendirme bandi: site yalnizca zorunlu cerezleri kullanir (oturum, dil).
// Analitik veya reklam cerezi eklenirse bu bilesen yeniden gercek bir onay bandina cevrilmelidir.
const NOTICE_COOKIE = 'aegisora_cookie_notice';

function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(name + '='));
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function CookieConsent() {
  const t = useTranslations('Cookie');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasCookie(NOTICE_COOKIE)) return;
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setCookie(NOTICE_COOKIE, 'seen', 365);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div role="region" aria-label="Cookies" className="fixed inset-x-0 bottom-0 z-[200] p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-xl border border-border bg-surface-2/98 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="shrink-0 rounded-md bg-surface-3 p-2">
            <Cookie className="size-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('text')}{' '}
            <Link href="/trust/privacy" className="text-foreground underline underline-offset-2 hover:text-primary">
              {t('link')}
            </Link>.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            {t('dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}