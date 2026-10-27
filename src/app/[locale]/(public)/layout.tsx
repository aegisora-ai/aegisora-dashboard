import { SiteFooter } from "@/components/aegisora/site-footer";
import { SiteHeader } from "@/components/aegisora/site-header";
import { publicFontVars } from "@/lib/public-fonts";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={"aeg-public bg-background text-foreground " + publicFontVars}>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
    </div>
  );
}