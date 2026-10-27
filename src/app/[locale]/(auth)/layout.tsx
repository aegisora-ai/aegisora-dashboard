import { AuthShell } from "@/components/aegisora/auth-shell";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AuthShell>{children}</AuthShell>;
}