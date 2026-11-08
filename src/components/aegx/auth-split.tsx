import "@/styles/aegx.css";
import { Inter } from "next/font/google";
import { Link } from "@/i18n/navigation";
import { AegxBrand } from "./brand";
import { AuthArt } from "./auth-art";
import { ForceDark } from "./force-dark";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export function AuthSplit({ children, de, wide }: { children: React.ReactNode; de: boolean; wide?: boolean }) {
  return (
    <div className={"aegx aegx-auth2 " + inter.variable}>
      <ForceDark />
      <section className="aegx-auth2__left">
        <header>
          <Link href="/" aria-label="Aegisora"><AegxBrand height={24} /></Link>
        </header>
        <main className={"aegx-auth2__form" + (wide ? " aegx-auth2__form--wide" : "")}>{children}</main>
        <footer className="aegx-auth2__foot">
          <span>&copy; {new Date().getFullYear()} Aegisora</span>
          <Link href="/trust/privacy">{de ? "Datenschutz" : "Privacy"}</Link>
          <Link href="/terms">{de ? "AGB" : "Terms"}</Link>
        </footer>
      </section>
      <aside className="aegx-auth2__right" aria-hidden="true">
        <AuthArt />
        <div className="aegx-auth2__cap">
          <h2>{de ? "Ein Agent schlägt vor." : "An agent proposes."}<br /><span>{de ? "Aegisora entscheidet." : "Aegisora decides."}</span></h2>
          <div className="aegx-auth2__chips">
            <span className="aegx-v aegx-v--allow">ALLOW</span>
            <span className="aegx-v aegx-v--escalate">ESCALATE</span>
            <span className="aegx-v aegx-v--block">BLOCK</span>
          </div>
        </div>
      </aside>
    </div>
  );
}