import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// support.aegisora.org serves only the help center. Everything else goes to the main site.
const SUPPORT_HOST = "support.aegisora.org";
const MAIN_ORIGIN = "https://aegisora.org";
// Keep in sync with COLLECTIONS in src/lib/support-content.ts
const SUPPORT_SLUGS = "getting-started|policies-decisions|access-security|pilots-pricing|aeri|help";
const CLEAN_PATH = new RegExp("^/(" + SUPPORT_SLUGS + ")(/[a-z0-9-]+)?/?$");

function isSupportHost(request: NextRequest): boolean {
  const raw = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const host = raw.split(",")[0].trim().toLowerCase().split(":")[0];
  return host === SUPPORT_HOST;
}

function handleSupport(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Drop an optional locale prefix such as /de or /en.
  const loc = routing.locales.find((l) => pathname === "/" + l || pathname.startsWith("/" + l + "/"));
  const rest = loc ? pathname.slice(loc.length + 1) || "/" : pathname;

  // /support/... on the support host becomes a clean path.
  if (rest === "/support" || rest.startsWith("/support/")) {
    const url = request.nextUrl.clone();
    url.pathname = rest.slice("/support".length) || "/";
    return NextResponse.redirect(url, 307);
  }

  const target = rest === "/" ? "/support" : CLEAN_PATH.test(rest) ? "/support" + rest.replace(/\/$/, "") : null;
  if (!target) {
    return NextResponse.redirect(MAIN_ORIGIN + pathname + search, 307);
  }
  const url = request.nextUrl.clone();
  url.pathname = "/" + routing.defaultLocale + target;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  if (isSupportHost(request)) {
    return handleSupport(request);
  }

  // API rotalarina dokunma: dil (locale) yonlendirmesi sadece sayfalar icin.
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Once auth session'i yenile / korumali route kontrolu yap.
  const authResponse = await updateSession(request);

  // Eger updateSession bir redirect dondurduyse (login'e veya dashboard'a), onu direkt kullan.
  if (authResponse.status !== 200 || authResponse.headers.get("location")) {
    return authResponse;
  }

  // Auth sorunu yoksa, dil yonlendirmesini normal calistir.
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};