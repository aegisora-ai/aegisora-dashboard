import Link from "next/link";
import { CtaBand, PageHero, Section, Eyebrow } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";
import { btnOutline, btnPrimary } from "@/lib/ui";
import { Check } from "lucide-react";

export const metadata = meta("Pricing", "Aegisora enterprise pricing plans.");

const plans = [
  {
    name: "Developer", price: "Free", target: "For individuals",
    features: ["Open-source runtime", "Local policy evaluation", "Community support"],
    cta: "Start Free", href: "/signup", highlight: false
  },
  {
    name: "Team", price: "$499", target: "Per workspace / month",
    features: ["Cloud runtime hosting", "Human approval workflows", "30-day audit retention", "Email support"],
    cta: "Start Trial", href: "/signup", highlight: true
  },
  {
    name: "Enterprise", price: "Custom", target: "For large organizations",
    features: ["Role-based access control", "Unlimited audit retention", "Custom Identity mapping", "24/7 SLA support"],
    cta: "Contact Sales", href: "/enterprise", highlight: false
  }
];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="PRICING" title="Scale securely." lead="Start building for free. Scale to enterprise governance when your agents are ready for production." />
      <Section>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`aeg-panel flex flex-col p-8 rounded-2xl ${p.highlight ? 'border-primary ring-1 ring-primary shadow-2xl relative scale-105' : ''}`}>
              {p.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>}
              <Eyebrow>{p.name.toUpperCase()}</Eyebrow>
              <div className="mt-4 text-5xl font-bold">{p.price}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.target}</p>
              <ul className="mt-8 space-y-4 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="size-5 text-cyan shrink-0" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`mt-10 w-full text-center ${p.highlight ? btnPrimary : btnOutline}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand title="Ready to secure your agents?" />
    </>
  );
}