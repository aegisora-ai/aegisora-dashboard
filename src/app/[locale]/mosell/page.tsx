import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Inter, Newsreader } from "next/font/google";
import styles from "./mosell.module.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Mosell",
  description: "The fastest way to govern your AI agents.",
};

export default function MosellWelcome() {
  return (
    <main className={`${styles.page} ${serif.variable} ${sans.variable}`}>
      <section className={styles.window} aria-labelledby="mosell-title">
        <header className={styles.bar}>
          <span className={styles.menu} aria-hidden="true" />
          <span className={styles.brand}>Aegisora</span>
        </header>

        <div className={styles.main}>
          <Image
            className={styles.logo}
            src="/brand/mosell-logo.svg"
            alt="Mosell logo"
            width={76}
            height={76}
            priority
            unoptimized
          />
          <h1 id="mosell-title" className={styles.title}>
            Mosell <em>for</em> Web
          </h1>
          <p className={styles.sub}>The fastest way to govern your AI agents</p>
        </div>

        <footer className={styles.cta}>
          <Link href="/dashboard" className={styles.button}>
            Get started
          </Link>
          <p className={styles.foot}>Built by Aegisora</p>
        </footer>
      </section>
    </main>
  );
}