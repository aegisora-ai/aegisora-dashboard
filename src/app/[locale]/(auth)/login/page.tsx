'use client';

import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Logo } from '@/components/aegisora/logo';

const STEPS = [
  'REQUEST',
  'CONTEXT',
  'POLICY',
  'RISK',
  'DECISION',
  'ENFORCEMENT',
  'EXECUTION',
  'EVIDENCE'
];

export default function LoginPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-[#020611]">
      
      {/* SOL PANEL - Izgara (Grid) Arka Planlı ve Animasyonlu */}
      <div className="hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-800/50 bg-[#020611] p-12 lg:flex relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 mb-10">
          <h1 className="mb-12 text-5xl font-light tracking-tight text-white">
            An agent proposes. <br />
            <span className="font-medium">Aegisora decides.</span>
          </h1>
          
          <div className="flex flex-col gap-3 font-mono text-xs font-semibold tracking-widest">
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              const isPassed = activeStep > idx;
              
              const stepClass = isActive 
                ? "text-[#1677ff] scale-105 origin-left" 
                : isPassed 
                  ? "text-slate-500" 
                  : "text-slate-700";
              
              return (
                <div 
                  key={step} 
                  className={`flex items-center gap-6 transition-all duration-500 ${stepClass}`}
                >
                  <span>0{idx + 1}</span>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SAĞ PANEL - Giriş Formu */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-[#061022]/80 p-10 shadow-2xl backdrop-blur-xl">
          
          <div className="flex flex-col items-center justify-center lg:hidden mb-8">
            <Logo />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Sign in to workspace</h2>
            <p className="mt-2 text-sm text-slate-400">
              Or <Link href="/signup" className="text-[#1677ff] hover:underline">create a new account</Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <input id="email-address" name="email" type="email" required className="relative block w-full rounded-lg border border-slate-700 bg-[#09162e] px-4 py-3 text-white placeholder-slate-500 focus:border-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff] sm:text-sm" placeholder="Email address" />
              </div>
              <div>
                <input id="password" name="password" type="password" required className="relative block w-full rounded-lg border border-slate-700 bg-[#09162e] px-4 py-3 text-white placeholder-slate-500 focus:border-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff] sm:text-sm" placeholder="Password" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-[#09162e] text-[#1677ff] focus:ring-[#1677ff]" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">Remember me</label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-[#1677ff] hover:text-[#0b6fb5]">Forgot your password?</Link>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-[#1677ff] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b6fb5] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}