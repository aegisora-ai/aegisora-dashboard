import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { authCookieOptions } from "@/lib/supabase/cookie-options";

function stripLocale(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(`/${locale}`.length) || "/" };
    }
  }
  return { locale: routing.defaultLocale, path: pathname };
}

function withLocale(locale: string, path: string) {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path}`;
}

export async function updateSession(request: NextRequest, baseResponse?: NextResponse) {
  const response = baseResponse ?? NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, path } = stripLocale(request.nextUrl.pathname);

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute = path.startsWith("/dashboard") || path.startsWith("/onboarding");

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = withLocale(locale, "/login");
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = withLocale(locale, "/dashboard");
    return NextResponse.redirect(url);
  }

  return response;
}
