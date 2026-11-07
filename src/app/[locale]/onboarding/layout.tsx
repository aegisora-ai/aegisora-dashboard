import "@/styles/aeg-premium.css";
import { PremiumBackdrop } from "@/components/aegisora/fx/premium-backdrop";

export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="aeg-premium aeg-stage">
      <PremiumBackdrop />
      {children}
    </div>
  );
}