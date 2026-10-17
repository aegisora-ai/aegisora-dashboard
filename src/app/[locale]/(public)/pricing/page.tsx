import { Link } from "@/i18n/navigation";

export default function PricingPage() {
  return (
    <main className="aeg-page min-h-screen px-4 py-24 text-white sm:px-6">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pilot program</p>
        <h1 className="mt-3 aeg-display text-5xl sm:text-6xl">Scoped pricing for design partners</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg aeg-body-text">
          Aegisora is validating enterprise runtime-control workflows with design partners. We do not currently offer self-service paid plans or online checkout.
        </p>
      </section>

      <section className="mx-auto mt-14 max-w-4xl rounded-2xl border border-border bg-surface-1 p-8 sm:p-10">
        <h2 className="text-xl font-semibold">Pilot commercial scope</h2>
        <p className="mt-3 text-sm leading-6 aeg-body-text">
          Any paid pilot must be scoped and agreed in writing before customer data or production systems are connected. The proposal should specify workflow, environment, term, support boundaries, retention, security prerequisites, success criteria, and rollback.
        </p>
        <p className="mt-4 text-sm leading-6 aeg-body-text">
          Price, tax treatment, hosting, service levels, and production availability are not published or represented as established offers. There is no Stripe checkout or automated subscription billing today.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/enterprise" className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover">Pilot overview</Link>
          <Link href="/developers" className="rounded-lg border border-border px-5 py-3 text-sm font-bold text-white hover:bg-white/5">Review API docs</Link>
        </div>
      </section>
    </main>
  );
}
