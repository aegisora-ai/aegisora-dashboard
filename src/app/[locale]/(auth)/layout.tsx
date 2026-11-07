import "@/styles/aegx.css";
import { Inter } from "next/font/google";
import { AegxAurora } from "@/components/aegx/aurora";
import { AegxBrand } from "@/components/aegx/brand";
import { AegxFx } from "@/components/aegx/fx";
import { ForceDark } from "@/components/aegx/force-dark";
import { Link } from "@/i18n/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={"aegx aegx-auth " + inter.variable}>
      <ForceDark />
      <AegxFx />
      <div className="aegx-auth__art" aria-hidden="true"><AegxAurora intensity={0.9} /></div>
      <header className="aegx-auth__top">
        <Link href="/" aria-label="Aegisora"><AegxBrand height={24} /></Link>
      </header>
      <main className="aegx-auth__main">
        <div className="aegx-auth__card">{children}</div>
      </main>
    </div>
  );
}