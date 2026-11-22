"use client";

import { GradientBackdrop } from "./gradient-backdrop";
import { LiquidLogo } from "./liquid-logo";

export function PremiumBackdrop() {
  return (
    <>
      <GradientBackdrop />
      <div aria-hidden="true" className="aeg-mark">
        <LiquidLogo size={560} />
      </div>
    </>
  );
}