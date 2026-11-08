import "@/styles/aegc.css";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/aegisora/app-shell";
import { MobileNav } from "@/components/aegisora/mobile-nav";
import { MobileTableCards } from "@/components/aegisora/mobile-table-cards";
import { FeedbackHost } from "@/components/aegisora/live/feedback";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={"aegc " + inter.variable}>
      <AppShell>
        <div className="pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
      </AppShell>
      <MobileNav />
      <MobileTableCards />
      <FeedbackHost />
    </div>
  );
}
