import { Logo } from "@/components/aegisora/logo";
import { MAIN_SITE } from "@/lib/support-content";

export function SupportShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="aeg-page min-h-screen">
      <div className="aeg-light-band min-h-screen">
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="hidden text-sm font-semibold text-muted-foreground sm:inline">Support</span>
            </div>
            <nav aria-label="Support" className="flex items-center gap-5 text-sm font-medium">
              <a href={MAIN_SITE + "/docs"} className="hidden hover:text-primary sm:inline">API docs</a>
              <a href={MAIN_SITE + "/changelog"} className="hidden hover:text-primary sm:inline">Release notes</a>
              <a href={MAIN_SITE + "/contact"} className="hover:text-primary">Contact</a>
              <a href={MAIN_SITE + "/signup"} className="inline-flex h-9 items-center rounded bg-primary px-4 text-primary-foreground hover:bg-primary-hover">
                Test Aegisora
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-border">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
            <span>Aegisora Support</span>
            <div className="flex gap-5">
              <a href={MAIN_SITE + "/trust"} className="hover:text-primary">Trust center</a>
              <a href={MAIN_SITE + "/security"} className="hover:text-primary">Security</a>
              <a href={MAIN_SITE} className="hover:text-primary">aegisora.org</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}