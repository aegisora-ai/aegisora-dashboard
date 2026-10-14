import type { Metadata } from "next";
import { PageShell, CARD } from "@/components/aegisora/trust-ui";
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
    <PageShell
      eyebrow="Contact"
      title="Talk to the Aegisora team"
      intro="Tell us what you want to govern. We usually reply within one business day."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {TOPICS.map((t) => (
          <a
            key={t.title}
            href={"mailto:" + SITE.contactEmail + "?subject=" + encodeURIComponent(t.subject)}
            className={CARD + " block transition-opacity hover:opacity-80"}
          >
            <h2 className="text-lg font-semibold">{t.title}</h2>
            <p className="mt-2 text-sm opacity-75">{t.text}</p>
          </a>
        ))}
      </div>
      <p className="opacity-75">
        Email us directly at{" "}
        <a className="underline" href={"mailto:" + SITE.contactEmail}>
          {SITE.contactEmail}
        </a>
        .
      </p>
    </PageShell>
  );
}