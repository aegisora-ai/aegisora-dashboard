import { DM_Mono, Inter_Tight } from "next/font/google";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });

export const publicFontVars = sans.variable + " " + mono.variable;