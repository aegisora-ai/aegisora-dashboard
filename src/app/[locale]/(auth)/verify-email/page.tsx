import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        If email confirmation is enabled for this workspace, follow the Supabase Auth verification link sent to your work email before signing in. Check your spam folder if it does not arrive.
      </p>
      <Link href="/login" className="mt-6 inline-flex text-sm underline underline-offset-4">Return to sign in</Link>
    </div>
  );
}
