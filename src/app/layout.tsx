import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const appSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-app-sans",
  display: "swap",
});

const appMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-app-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aegisora | Runtime Security for AI Agents",
    template: "%s | Aegisora",
  },
  description:
    "Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, risk and authorization before it executes.",
};

const themeScript = `(function(){try{var t=localStorage.getItem("aeg-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${appSans.variable} ${appMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}