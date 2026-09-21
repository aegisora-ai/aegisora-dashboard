"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnPrimary } from "@/lib/ui";

type Field = {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
};

type Props = {
  title: string;
  description: string;
  fields: Field[];
  submitLabel: string;
  redirectTo: string;
  links?: { text: string; label: string; href: string }[];
};

export function AuthForm({ title, description, fields, submitLabel, redirectTo, links }: Props) {
  const router = useRouter();

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <p className="mt-6 rounded-sm border border-escalate/30 bg-escalate-muted px-3 py-2 text-xs text-escalate">
        Prototype: no account is created and authentication is not yet connected.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(redirectTo);
        }}
      >
        {fields.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <Label htmlFor={f.name}>{f.label}</Label>
            <Input id={f.name} name={f.name} type={f.type} autoComplete={f.autoComplete} required />
          </div>
        ))}
        <button type="submit" className={`${btnPrimary} w-full`}>
          {submitLabel}
        </button>
      </form>

      {links && (
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          {links.map((l) => (
            <li key={l.href}>
              {l.text}{" "}
              <Link href={l.href} className="text-cyan underline-offset-4 hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}