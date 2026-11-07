import "./bw/bw.css";
import "./bw/auth-bw.css";
import { BwHeader } from "./bw/bw-header";
import { BwFooter } from "./bw/bw-footer";
import { bwFontVars } from "./bw/bw-font-vars";
import "@/styles/aeg-auth-glass.css";
import { LiquidBackdrop } from "./calm/liquid-backdrop";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={"bw-root bw-authpage " + bwFontVars}>
      <LiquidBackdrop />
      <BwHeader />
      <main className="bw-auth">
        <div className="bw-auth__card">{children}</div>
      </main>
      <BwFooter />
    </div>
  );
}