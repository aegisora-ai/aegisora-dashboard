import "@/styles/aegx.css";
import { Inter } from "next/font/google";
import { AegxFooter } from "@/components/aegx/footer";
import { AegxHeader } from "@/components/aegx/header";
import { ForceDark } from "@/components/aegx/force-dark";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={"aegx " + inter.variable}>
      <ForceDark />
      <AegxHeader />
      <main>{children}</main>
      <AegxFooter />
    </div>
  );
}