import { Link } from "@/i18n/navigation";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#020611] px-4 py-24 text-white sm:px-6">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#1677ff]">Pilot program</p>
        <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Scoped pricing for design partners</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          Aegisora is validating enterprise runtime-control workflows with design partners. We do not currently offer self-service paid plans or online checkout.
        </p>
      </section>

      <section className="mx-auto mt-14 max-w-4xl rounded-2xl border border-slate-700 bg-[#061022] p-8 sm:p-10">
        <h2 className="text-xl font-semibold">Pilot commercial scope</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Any paid pilot must be scoped and agreed in writing before customer data or production systems are connected. The proposal should specify workflow, environment, term, support boundaries, retention, security prerequisites, success criteria, and rollback.
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Price, tax treatment, hosting, service levels, and production availability are not published or represented as established offers. There is no Stripe checkout or automated subscription billing today.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/enterprise" className="rounded-lg bg-[#1677ff] px-5 py-3 text-sm font-bold text-white hover:bg-[#0b6fb5]">Pilot overview</Link>
          <Link href="/developers" className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-bold text-white hover:bg-white/5">Review API docs</Link>
        </div>
      </section>
    </main>
  );
}
