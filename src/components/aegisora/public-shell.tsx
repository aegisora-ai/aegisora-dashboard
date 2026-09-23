import { SiteHeader } from "@/components/aegisora/site-header";
import { SiteFooter } from "@/components/aegisora/site-footer";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}