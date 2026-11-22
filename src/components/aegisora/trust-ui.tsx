import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

export const CARD =
  "rounded-xl border p-6 [border-color:color-mix(in_srgb,currentColor_15%,transparent)]";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20">
      <p className="text-sm font-medium uppercase tracking-widest opacity-60">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg opacity-75">{intro}</p>
      <div className="mt-12 space-y-10">{children}</div>
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80";
  const style = primary
    ? "bg-current [&>span]:invert"
    : "border [border-color:color-mix(in_srgb,currentColor_30%,transparent)]";
  return (
    <Link href={href} className={base + " " + style}>
      <span>{children}</span>
    </Link>
  );
}