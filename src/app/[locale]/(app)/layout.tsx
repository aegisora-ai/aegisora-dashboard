import "@/styles/aeg-contrast.css";
import "@/styles/aeg-premium.css";
import "@/styles/aeg-dash-teal.css";
import "@/styles/aeg-dash-status.css";
import { AppShell } from "@/components/aegisora/app-shell";
import { MobileNav } from "@/components/aegisora/mobile-nav";
import { MobileTableCards } from "@/components/aegisora/mobile-table-cards";
import { FeedbackHost } from "@/components/aegisora/live/feedback";
import { SoundProvider } from "@/components/aegisora/live/sound-provider";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="aeg-premium">
      <AppShell>
        <div className="pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
      </AppShell>
      <MobileNav />
      <MobileTableCards />
      <FeedbackHost />
      <SoundProvider />
    </div>
  );
}