import Link from "next/link";
import { PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta("Trust", "Privacy, subprocessors, and terms for Aegisora.");

const items = [
  { href: "/trust/privacy", title: "Privacy", copy: "What data Aegisora processes and why." },
  { href: "/trust/subprocessors", title: "Subprocessors", copy: "Providers that process data on our behalf." },
  { href: "/terms", title: "Terms", copy: "How pilots and the service are governed." },
  { href: "/security", title: "Security", copy: "How the execution boundary is protected." },
];

export default function TrustPage() {
  return (
    <>
      <PageHero eyebrow="TRUST" title="What we process, and who helps." lead="Plain statements about data handling. Documents marked Draft are pending legal review." />
      <Section>
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i.href} className="aeg-panel p-5">
              <Link href={i.href} className="text-sm font-medium underline underline-offset-4">{i.title}</Link>
              <p className="mt-2 text-sm text-muted-foreground">{i.copy}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}