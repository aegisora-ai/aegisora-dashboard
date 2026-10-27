import localFont from "next/font/local";

const display = localFont({
  src: [{ path: "../../../../public/fonts/zp/inter-tight-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--bw-f-display",
  display: "swap",
});
const body = localFont({
  src: [{ path: "../../../../public/fonts/zp/inter-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--bw-f-body",
  display: "swap",
});
const mono = localFont({
  src: [{ path: "../../../../public/fonts/zp/jetbrains-mono-latin.woff2", weight: "100 800", style: "normal" }],
  variable: "--bw-f-mono",
  display: "swap",
});
const serif = localFont({
  src: [{ path: "../../../../public/fonts/zp/instrument-serif-latin-italic.woff2", weight: "400", style: "italic" }],
  variable: "--bw-f-serif",
  display: "swap",
});
export const bwFontVars = [display.variable, body.variable, mono.variable, serif.variable].join(" ");