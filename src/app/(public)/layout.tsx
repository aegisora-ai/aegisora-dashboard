import { SiteFooter } from "@/components/aegisora/site-footer";
import { SiteHeader } from "@/components/aegisora/site-header";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="aeg-public">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}