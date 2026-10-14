import type { Metadata } from "next";
import "@fontsource-variable/archivo";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}