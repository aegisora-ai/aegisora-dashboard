import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions } from "@/lib/supabase/cookie-options";

// navigator.locks tabanli kilit mekanizmasi bazi tarayici/incognito
// senaryolarinda askida kalip auth cagrilarini sonsuza kadar bekletebiliyor.
// Kilidi atlayip fonksiyonu dogrudan calistiran bir "no-op" lock kullaniyoruz.
async function noOpLock<R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> {
  return await fn();
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookieOptions: authCookieOptions,
      auth: {
        lock: noOpLock,
      },
    },
  );
}
