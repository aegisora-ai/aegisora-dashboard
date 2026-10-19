import { Link } from "@/i18n/navigation";
import { PublicShell } from "@/components/aegisora/public-shell";

export const metadata = { title: "Impressum | Aegisora" };

export default function ImpressumPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Impressum</h1>
        <p className="mt-2 text-sm opacity-70">Legal notice pursuant to § 5 DDG</p>

        <h2 className="mt-10 text-lg font-semibold">Provider</h2>
        <p className="mt-2 leading-relaxed">
          Eray Özer<br />
          Aegisora (trade name)<br />
          Zurmaiener Straße 98<br />
          54292 Trier<br />
          Germany
        </p>

        <h2 className="mt-8 text-lg font-semibold">Contact</h2>
        <p className="mt-2 leading-relaxed">
          Email: <a className="underline" href="mailto:eray@aegisora.org">eray@aegisora.org</a><br />
          Contact form: <Link className="underline" href="/contact">aegisora.org/contact</Link>
        </p>

        <h2 className="mt-8 text-lg font-semibold">Responsible for content (§ 18 Abs. 2 MStV)</h2>
        <p className="mt-2 leading-relaxed">
          Eray Özer, Zurmaiener Straße 98, 54292 Trier, Germany
        </p>

        <h2 className="mt-8 text-lg font-semibold">Dispute resolution</h2>
        <p className="mt-2 leading-relaxed">
          We are neither obliged nor willing to participate in dispute resolution proceedings
          before a consumer arbitration board.
        </p>
      </div>
    </PublicShell>
  );
}