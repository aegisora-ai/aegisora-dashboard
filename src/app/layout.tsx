import PwaBoot from "@/components/pwa-boot";
import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import "@fontsource-variable/archivo";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: {
    default: "Aegisora | Runtime Security for AI Agents",
    template: "%s | Aegisora",
  },
  description:
    "Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, risk and authorization before it executes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${barlow.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      <PwaBoot />
</body>
    </html>
  );
}