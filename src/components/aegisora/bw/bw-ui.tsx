import "./bw.css";
import type { CSSProperties, ReactNode } from "react";
import {
  Check,
  FileText,
  Gauge,
  Eye,
  KeyRound,
  Layers,
  Lock,
  Plug,
  Route,
  Search,
  Settings,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Verdict } from "./bw-data";

/* ---------------------------- brand mark ---------------------------- */

export function BwMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="bw-mark">
      <path
        d="M16 2.6 4.6 6.9v8.2c0 7 4.8 12.1 11.4 14.5 6.6-2.4 11.4-7.5 11.4-14.5V6.9L16 2.6Z"
        fill="currentColor"
      />
      <path d="M10.6 16.2l3.7 3.7 7.1-7.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BwLogo({ className }: { className?: string }) {
  return (
    <span className={"bw-logo" + (className ? " " + className : "")}>
      <BwMark />
      <span>Aegisora</span>
    </span>
  );
}

/* ------------------------------ icons ------------------------------- */

export function BwIcon({ name, className }: { name: string; className?: string }) {
  const p = { className, "aria-hidden": true } as const;
  switch (name) {
    case "layers":
      return <Layers {...p} />;
    case "route":
      return <Route {...p} />;
    case "gauge":
      return <Gauge {...p} />;
    case "eye":
      return <Eye {...p} />;
    case "plug":
      return <Plug {...p} />;
    case "file":
      return <FileText {...p} />;
    case "key":
      return <KeyRound {...p} />;
    case "help":
      return <Users {...p} />;
    case "zap":
      return <Zap {...p} />;
    case "search":
      return <Search {...p} />;
    case "users":
      return <Users {...p} />;
    case "lock":
      return <Lock {...p} />;
    case "target":
      return <Target {...p} />;
    case "settings":
      return <Settings {...p} />;
    default:
      return <Check {...p} />;
  }
}

/* ----------------------------- buttons ------------------------------ */

export type BtnTone = "dark" | "light" | "blue" | "white" | "ghost";

export function BwBtn({
  href,
  tone = "dark",
  children,
  className,
  size = "md",
}: {
  href: string;
  tone?: BtnTone;
  children: ReactNode;
  className?: string;
  size?: "md" | "lg" | "sm";
}) {
  return (
    <Link href={href} className={"bw-btn bw-btn--" + tone + " bw-btn--" + size + (className ? " " + className : "")}>
      {children}
    </Link>
  );
}

/* ------------------------- section scaffolding ----------------------- */

export function BwSection({
  id,
  children,
  className,
  flush,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section id={id} className={"bw-sec" + (className ? " " + className : "")}>
      <div className={"bw-wrap" + (flush ? " bw-wrap--flush" : "")}>{children}</div>
    </section>
  );
}

export function BwHatch() {
  return <div aria-hidden="true" className="bw-hatch" />;
}

export function BwHead({
  eyebrow,
  title,
  intro,
  align = "center",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "split";
  children?: ReactNode;
}) {
  if (align === "split") {
    return (
      <header className="bw-head bw-head--split bw-rv">
        <div>
          <p className="bw-eyebrow">{eyebrow}</p>
          <h2 className="bw-h2">{title}</h2>
        </div>
        {intro ? <p className="bw-lead">{intro}</p> : null}
      </header>
    );
  }
  return (
    <header className="bw-head bw-rv">
      <p className="bw-eyebrow">{eyebrow}</p>
      <h2 className="bw-h2">{title}</h2>
      {intro ? <p className="bw-lead">{intro}</p> : null}
      {children}
    </header>
  );
}

/* ------------------------------ pieces ------------------------------ */

export function Ball({
  tone,
  children,
  className,
  style,
}: {
  tone: "blue" | "green" | "dark" | "pink" | "white";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span aria-hidden="true" className={"bw-ball bw-ball--" + tone + (className ? " " + className : "")} style={style}>
      {children}
    </span>
  );
}

export function Pill({ verdict, className }: { verdict: Verdict; className?: string }) {
  return (
    <span className={"bw-pill bw-pill--" + verdict.toLowerCase() + (className ? " " + className : "")}>
      <i aria-hidden="true" />
      {verdict}
    </span>
  );
}

export function Marquee({
  items,
  label,
  className,
  render,
}: {
  items: string[];
  label: string;
  className?: string;
  render: (item: string, i: number) => ReactNode;
}) {
  const doubled = items.concat(items);
  return (
    <div className={"bw-marquee" + (className ? " " + className : "")}>
      <div aria-hidden="true" className="bw-marquee__track">
        {doubled.map((it, i) => render(it, i))}
      </div>
      <span className="bw-sr">{label}</span>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bw-stat">
      <div className="bw-stat__v">{value}</div>
      <div className="bw-stat__l">{label}</div>
    </div>
  );
}