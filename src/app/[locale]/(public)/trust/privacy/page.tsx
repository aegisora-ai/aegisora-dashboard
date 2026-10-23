import Link from "next/link";
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
            <h2 className="text-base font-medium text-foreground">Controller</h2>
            <p className="mt-3">Eray &Ouml;zer (trading as Aegisora), Zurmaiener Stra&szlig;e 98, 54292 Trier, Germany. Email: <a href="mailto:eray@aegisora.org" className="underline underline-offset-4">eray@aegisora.org</a>. You may lodge a complaint with a data protection supervisory authority; for Rheinland-Pfalz this is the LfDI Rheinland-Pfalz.</p>
          </div>
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
            <h2 className="text-base font-medium text-foreground">Payments and sensitive data</h2>
            <p className="mt-3">Payments are processed by Stripe. We do not store card numbers. We store Stripe customer and subscription identifiers, payment status and the billing details you enter at checkout. Pilot workspaces are non-production: do not submit sensitive personal, health, or payment data.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Purposes</h2>
            <p className="mt-3">Operating accounts and workspaces, securing the service, providing support, and evaluating pilots. The final list of purposes and legal bases is pending legal review.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Cookies</h2>
            <p className="mt-3">We use essential cookies to run the site. We do not use analytics or advertising cookies. We use Sentry (EU region) for error monitoring; error reports can include your IP address and browser details.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Retention</h2>
            <p className="mt-3">A retention schedule has not been finalized. It will be published here once approved.</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Providers and transfers</h2>
            <p className="mt-3">Providers that process data for us are listed on the <Link href="/trust/subprocessors" className="underline underline-offset-4">subprocessors page</Link>. Primary hosting is in Frankfurt, Germany (Supabase eu-central-1, Vercel functions in fra1). Error monitoring uses the Sentry EU region. Some providers are headquartered outside the EU, so transfers may occur and rely on the data processing terms of each provider.</p>
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