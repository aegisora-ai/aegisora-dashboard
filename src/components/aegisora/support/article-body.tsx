import { getTranslations } from "next-intl/server";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { slugify, type Block } from "@/lib/support-content";

export async function ArticleBody({ blocks, locale }: { blocks: Block[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "HelpCenter" });
  const CALL = {
    note: { Icon: Info, label: t("note"), cls: "border-border bg-surface-3" },
    tip: { Icon: Lightbulb, label: t("tip"), cls: "border-border bg-surface-3" },
    warn: { Icon: AlertTriangle, label: t("warn"), cls: "border-[#f0b429]/50 bg-[#f0b429]/10" },
  } as const;

  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (b.t === "h")
          return (
            <h2 key={i} id={slugify(b.text)} className="aeg-display scroll-mt-24 pt-6 text-2xl sm:text-3xl">
              {b.text}
            </h2>
          );
        if (b.t === "p") return <p key={i} className="aeg-body-text text-base leading-7">{b.text}</p>;
        if (b.t === "ul")
          return (
            <ul key={i} className="aeg-body-text list-disc space-y-2 pl-6 text-base leading-7">
              {b.items.map((x) => <li key={x}>{x}</li>)}
            </ul>
          );
        if (b.t === "ol")
          return (
            <ol key={i} className="aeg-body-text list-decimal space-y-2 pl-6 text-base leading-7">
              {b.items.map((x) => <li key={x}>{x}</li>)}
            </ol>
          );
        const k = CALL[b.t];
        const Icon = k.Icon;
        return (
          <div key={i} className={"flex gap-3 rounded-xl border p-4 text-sm leading-6 " + k.cls}>
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p><span className="font-semibold">{k.label}: </span>{b.text}</p>
          </div>
        );
      })}
    </div>
  );
}