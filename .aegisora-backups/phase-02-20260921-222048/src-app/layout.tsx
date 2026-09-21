import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: "swap" 
});

export const metadata: Metadata = {
  title: "Aegisora",
  description: "Aegisora UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-white text-black min-h-screen flex flex-col`}>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
