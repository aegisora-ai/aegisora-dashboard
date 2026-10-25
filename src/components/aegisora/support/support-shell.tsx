import { Logo } from "@/components/aegisora/logo";
import { MAIN_SITE } from "@/lib/support-content";

const BG =
  "radial-gradient(ellipse 42% 40% at 6% 0%, rgba(21,153,255,0.35) 0%, rgba(21,153,255,0) 70%), radial-gradient(ellipse 45% 40% at 94% 100%, rgba(15,155,255,0.30) 0%, rgba(15,155,255,0) 70%), #001a6e";

export function SupportShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white" style={{ background: BG }}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden text-sm font-semibold text-white/70 sm:inline">Support</span>
          </div>
          <nav aria-label="Support" className="flex items-center gap-5 text-sm font-medium">
            <a href={MAIN_SITE + "/docs"} className="hidden text-white/80 hover:text-white sm:inline">Docs</a>
            <a href={MAIN_SITE + "/docs/technical"} className="hidden text-white/80 hover:text-white sm:inline">Technical docs</a>
            <a href={MAIN_SITE + "/pilot"} className="text-white/80 hover:text-white">Contact</a>
            <a
              href={MAIN_SITE + "/signup"}
              className="inline-flex h-9 items-center rounded-md bg-white px-4 font-semibold text-[#0a2a7a] hover:bg-white/90"
            >
              Test Aegisora
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-white/10">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-white/60 sm:px-6">
          <span>Aegisora Support</span>
          <div className="flex gap-5">
            <a href={MAIN_SITE + "/trust"} className="hover:text-white">Trust center</a>
            <a href={MAIN_SITE + "/security"} className="hover:text-white">Security</a>
            <a href={MAIN_SITE} className="hover:text-white">aegisora.org</a>
          </div>
        </div>
      </footer>
    </div>
  );
}