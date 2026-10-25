import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta("Trust", "Privacy, subprocessors, and terms for Aegisora.");

export default function TrustPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title="What we process, and who helps."
        intro="Plain statements about data handling. Documents marked Draft are pending legal review."
        primary={{ label: "Contact us", href: "/pilot" }}
        secondary={{ label: "Security", href: "/security" }}
      />
      <Section title="Trust documents" tone="alt">
        <CardGrid
          cols={2}
          items={[
            { icon: "Eye", title: "Privacy", body: "What data Aegisora processes and why.", href: "/trust/privacy" },
            { icon: "Users", title: "Subprocessors", body: "Providers that process data on our behalf.", href: "/trust/subprocessors" },
            { icon: "FileText", title: "Terms", body: "How pilots and the service are governed.", href: "/terms" },
            { icon: "ShieldCheck", title: "Security", body: "How the execution boundary is protected.", href: "/security" },
          ]}
        />
      </Section>
      <CtaBand
        title="Questions about data handling?"
        body="Talk to the team about security reviews and pilot prerequisites."
        primary={{ label: "Contact us", href: "/pilot" }}
        secondary={{ label: "Run live runtime proof", href: "/proof" }}
      />
    </>
  );
}