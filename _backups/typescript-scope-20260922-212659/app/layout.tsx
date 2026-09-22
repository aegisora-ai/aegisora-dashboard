import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Aegisora — Runtime Security for AI Agents",
  description:
    "Runtime security and governance for autonomous AI agents. Control what agents are allowed to do before execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
        />
        {children}
      </body>
    </html>
  );
}