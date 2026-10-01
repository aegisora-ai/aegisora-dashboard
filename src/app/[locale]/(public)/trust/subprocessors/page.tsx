import { PageHero, Section, DataTable } from "@/components/aegisora/page-kit";
import { DraftNotice } from "@/components/aegisora/draft-notice";
import { meta } from "@/lib/seo";

export const metadata = meta("Subprocessors", "Providers that process data on behalf of Aegisora. Draft, pending verification.");

export default function SubprocessorsPage() {
  return (
    <>
      <PageHero eyebrow="SUBPROCESSORS" title="Who processes data for us." lead="Providers used to run the service." />
      <Section>
        <DraftNotice>Draft. Regions and contract status are being verified and are marked to be confirmed. This list may be incomplete until verification is finished.</DraftNotice>
        <DataTable
          head={["Provider", "Purpose", "Data", "Region", "Contract status"]}
          rows={[
            ["Supabase", "Authentication and database", "Account, workspace, and product data", "To be confirmed", "To be confirmed"],
            ["Vercel", "Hosting and deployment", "Web and request metadata", "To be confirmed", "To be confirmed"],
          ]}
        />
      </Section>
    </>
  );
}