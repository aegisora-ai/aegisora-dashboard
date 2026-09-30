'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/aegisora/logo';
import { AmbientGridCells } from '@/components/aegisora/ambient-grid-cells';

const STEPS = [
  'REQUEST',
  'CONTEXT',
  'POLICY',
  'RISK',
  'DECISION',
  'ENFORCEMENT',
  'EXECUTION',
  'EVIDENCE',
];

export function AuthSidePanel() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-800/50 bg-[#020611] p-12 lg:flex relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />

      <AmbientGridCells cols={15} rows={24} count={32} opacity={0.35} />

      <div className="absolute inset-0 bg-gradient-to-b from-[#020611] via-transparent to-[#020611]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020611_85%)]" />

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
              ? 'text-[#1677ff] scale-105 origin-left'
              : isPassed
                ? 'text-slate-500'
                : 'text-slate-700';

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
  );
}
