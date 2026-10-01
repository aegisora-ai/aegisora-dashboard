import { PageHero, Section } from "@/components/aegisora/page-kit";
import { DraftNotice } from "@/components/aegisora/draft-notice";
import { meta } from "@/lib/seo";

export const metadata = meta("Privacy", "What data Aegisora processes and why. Draft, pending legal review.");

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="PRIVACY" title="Privacy." lead="What Aegisora processes, why, and how to reach us." />
      <Section>
        <DraftNotice>Draft. This page describes current practice and has not yet been reviewed by legal counsel. It is not final legal text.</DraftNotice>
        <div className="max-w-2xl space-y-8 text-sm leading-6 text-muted-foreground">
          <div>
            <h2 className="text-base font-medium text-foreground">What we process</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Account information: email address, name, and company.</li>
              <li>Authentication data, handled by our authentication provider.</li>
              <li>Workspace and product configuration, such as agents and policies.</li>
              <li>Runtime metadata and decision and evidence records that your integration submits through the API.</li>
              <li>Support and sales communications you send us.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">What we do not collect</h2>
            <p className="mt-3">No payment details are collected in this application. Pilot workspaces are non-production: do not submit sensitive personal, health, or payment data.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Purposes</h2>
            <p className="mt-3">Operating accounts and workspaces, securing the service, providing support, and evaluating pilots. The final list of purposes and legal bases is pending legal review.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Cookies</h2>
            <p className="mt-3">We use essential cookies to run the site. Analytics cookies are used only with your consent, and you can reject them.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Retention</h2>
            <p className="mt-3">A retention schedule has not been finalized. It will be published here once approved.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Providers and transfers</h2>
            <p className="mt-3">Providers that process data for us are listed on the <a href="/trust/subprocessors" className="underline underline-offset-4">subprocessors page</a>. Regions and transfer mechanisms are to be confirmed.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Your rights and contact</h2>
            <p className="mt-3">To request access, correction, or deletion of your data, write to <a href="mailto:hello@aegisora.org" className="underline underline-offset-4">hello@aegisora.org</a>.</p>
          </div>
        </div>
      </Section>
    </>
  );
}