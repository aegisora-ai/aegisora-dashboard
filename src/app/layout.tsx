import PwaBoot from "@/components/pwa-boot";
import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import "@fontsource-variable/archivo";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import "./globals.css";
import { getLocale } from "next-intl/server";
import { AegisoraSound } from '../components/aegisora-sound';
import { ThemeBoot } from "@/components/aegisora/theme-boot";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-barlow",
});

export const viewport: Viewport = {
  themeColor: "#020b2e",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://aegisora.org"),
  alternates: { canonical: "./" },
  openGraph: { siteName: "Aegisora", type: "website" },
  title: {
    default: "Aegisora | Runtime Security for AI Agents",
    template: "%s | Aegisora",
  },
  description:
    "Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, risk and authorization before it executes.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={barlow.variable + " dark"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <PwaBoot />
        <AegisoraSound />
        <ThemeBoot />
      </body>
    </html>
  );
}