import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
