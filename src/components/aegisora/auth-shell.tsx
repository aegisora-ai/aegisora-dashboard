import "./bw/bw.css";
import "./bw/auth-bw.css";
import { BwHeader } from "./bw/bw-header";
import { BwFooter } from "./bw/bw-footer";
import { bwFontVars } from "./bw/bw-font-vars";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={"bw-root bw-authpage " + bwFontVars}>
      <BwHeader />
      <main className="bw-auth">
        <div className="bw-auth__card">{children}</div>
      </main>
      <BwFooter />
    </div>
  );
}