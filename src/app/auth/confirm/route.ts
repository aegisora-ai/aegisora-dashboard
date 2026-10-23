import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/de/set-password";
  // Open redirect korumasi: sadece site ici yollar
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/de/set-password";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const url = request.nextUrl.clone();
      url.pathname = next;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = "/de/login";
  url.search = "?error=invalid_link";
  return NextResponse.redirect(url);
}