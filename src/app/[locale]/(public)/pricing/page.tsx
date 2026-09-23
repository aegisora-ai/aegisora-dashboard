import React from 'react';
import { Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020611] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold uppercase tracking-wider text-[#1677ff]">Pricing</h2>
          <p className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">Scale securely.</p>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-400">
            Start building for free. Scale to enterprise governance when your agents are ready for production.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          {/* FREE */}
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#061022] p-8 shadow-xl transition-transform hover:-translate-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Developer</h3>
            <p className="mt-4 text-5xl font-extrabold text-white">Free</p>
            <p className="mt-4 text-sm text-slate-400">For individuals</p>
            <ul className="mt-8 flex-1 space-y-4">
              {['Open-source runtime', 'Local policy evaluation', 'Community support'].map((feature) => (
                <li key={feature} className="flex items-center text-slate-300"><Check className="mr-3 h-5 w-5 text-[#1677ff]" />{feature}</li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-8 block w-full rounded-lg border border-[#1677ff] bg-transparent py-3 text-center text-sm font-bold text-[#1677ff] hover:bg-[#1677ff]/10">Start Free</Link>
          </div>

          {/* TEAM (Most Popular) */}
          <div className="relative flex flex-col rounded-2xl border-2 border-[#1677ff] bg-[#09162e] p-8 shadow-[0_0_30px_rgba(22,119,255,0.15)] transition-transform hover:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#1677ff] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">Most Popular</div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1677ff]">Team</h3>
            <p className="mt-4 flex items-baseline text-5xl font-extrabold text-white">$499<span className="ml-2 text-xl font-medium text-slate-400">/mo</span></p>
            <p className="mt-4 text-sm text-slate-400">Per workspace</p>
            <ul className="mt-8 flex-1 space-y-4">
              {['Cloud runtime hosting', 'Human approval workflows', '30-day audit retention', 'Email support'].map((feature) => (
                <li key={feature} className="flex items-center text-slate-300"><Check className="mr-3 h-5 w-5 text-[#1677ff]" />{feature}</li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-8 block w-full rounded-lg bg-[#1677ff] py-3 text-center text-sm font-bold text-white shadow-lg hover:bg-[#0b6fb5]">Start Trial</Link>
          </div>

          {/* ENTERPRISE */}
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#061022] p-8 shadow-xl transition-transform hover:-translate-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Enterprise</h3>
            <p className="mt-4 text-5xl font-extrabold text-white">Custom</p>
            <p className="mt-4 text-sm text-slate-400">For large organizations</p>
            <ul className="mt-8 flex-1 space-y-4">
              {['Role-based access control', 'Unlimited audit retention', 'Custom Identity mapping', '24/7 SLA support'].map((feature) => (
                <li key={feature} className="flex items-center text-slate-300"><Check className="mr-3 h-5 w-5 text-[#1677ff]" />{feature}</li>
              ))}
            </ul>
            <Link href="/contact" className="mt-8 block w-full rounded-lg border border-slate-700 bg-slate-800 py-3 text-center text-sm font-bold text-white hover:bg-slate-700">Contact Sales</Link>
          </div>
        </div>
      </div>
    </div>
  );
}