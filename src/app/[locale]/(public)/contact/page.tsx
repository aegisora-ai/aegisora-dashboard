import type { Metadata } from "next";
import { PageHero, Section } from "@/components/aegisora/page-kit";
import { SITE } from "@/lib/aegisora/site-config";

export const metadata: Metadata = {
  title: "Contact | Aegisora",
  description: "Contact the Aegisora team for sales, pilots, security reviews and support.",
};

const TOPICS = [
  { title: "Sales and pilots", subject: "Aegisora pilot request", text: "Plans, pricing and onboarding for your team." },
  { title: "Security review", subject: "Aegisora security review", text: "Questionnaires, architecture and data handling." },
  { title: "Support", subject: "Aegisora support", text: "Help with your workspace, agents and policies." },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the Aegisora team"
        intro="Tell us what you want to govern. We usually reply within one business day."
      />
      <Section title="How can we help?" tone="alt">
        <div className="grid gap-4 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <a
              key={t.title}
              href={"mailto:" + SITE.contactEmail + "?subject=" + encodeURIComponent(t.subject)}
              className="block h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-0.5 hover:border-sky-400/50 hover:bg-white/[0.07]"
            >
              <h3 className="text-lg font-medium">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{t.text}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-sky-300">Send an email</span>
            </a>
          ))}
        </div>
        <p className="mt-8 text-white/70">
          Email us directly at{" "}
          <a className="text-sky-300 underline underline-offset-4" href={"mailto:" + SITE.contactEmail}>
            {SITE.contactEmail}
          </a>
          .
        </p>
      </Section>
    </>
  );
}