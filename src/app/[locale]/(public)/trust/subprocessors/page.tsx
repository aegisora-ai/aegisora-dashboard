import { PageHero, Section, DataTable } from "@/components/aegisora/page-kit";
import { DraftNotice } from "@/components/aegisora/draft-notice";
import { meta } from "@/lib/seo";

export const metadata = meta("Subprocessors", "Providers that process data on behalf of Aegisora. Draft, pending verification.");

export default function SubprocessorsPage() {
  return (
    <>
      <PageHero eyebrow="SUBPROCESSORS" title="Who processes data for us." lead="Providers used to run the service." />
      <Section>
        <DraftNotice>Draft. Hosting regions for Supabase, Vercel and Sentry are verified. Contract status and the Stripe region are being verified and are marked to be confirmed.</DraftNotice>
        <DataTable
          head={["Provider", "Purpose", "Data", "Region", "Contract status"]}
          rows={[
            ["Supabase", "Authentication and database", "Account, workspace, and product data", "Frankfurt, Germany (eu-central-1)", "To be confirmed"],
            ["Vercel", "Hosting and deployment", "Web and request metadata", "Functions in Frankfurt, Germany (fra1); global edge network", "To be confirmed"],
            ["Sentry", "Error monitoring", "Error reports, IP address, browser details", "EU region", "To be confirmed"],
            ["Stripe", "Payment processing", "Billing details, customer and subscription identifiers", "To be confirmed", "To be confirmed"],
            
          ]}
        />
      </Section>
    </>
  );
}