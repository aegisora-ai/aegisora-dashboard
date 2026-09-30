import type { CookieOptions } from "@supabase/ssr";

/** Shared browser/server cookie settings; retain Supabase's cookie name for session compatibility. */
export const authCookieOptions: CookieOptions = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: false,
  maxAge: 7 * 24 * 60 * 60,
};
