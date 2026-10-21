import { SiteFooter } from "@/components/aegisora/site-footer";
import { SiteHeader } from "@/components/aegisora/site-header";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="aeg-public">
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
    </div>
  );
}