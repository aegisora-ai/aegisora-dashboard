import { getTranslations } from "next-intl/server";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { slugify, type Block } from "@/lib/support-content";

export async function ArticleBody({ blocks, locale }: { blocks: Block[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "HelpCenter" });
  const CALL = {
    note: { Icon: Info, label: t("note"), cls: "" },
    tip: { Icon: Lightbulb, label: t("tip"), cls: "" },
    warn: { Icon: AlertTriangle, label: t("warn"), cls: " aegx-callout--warn" },
  } as const;

  return (
    <div>
      {blocks.map((b, i) => {
        if (b.t === "h") return <h2 key={i} id={slugify(b.text)} className="aegx-art__h2" style={{ scrollMarginTop: 90 }}>{b.text}</h2>;
        if (b.t === "p") return <p key={i} className="aegx-art__p">{b.text}</p>;
        if (b.t === "ul") return <ul key={i} className="aegx-art__ul">{b.items.map((x) => <li key={x}>{x}</li>)}</ul>;
        if (b.t === "ol") return <ol key={i} className="aegx-art__ul aegx-art__ol">{b.items.map((x) => <li key={x}>{x}</li>)}</ol>;
        const k = CALL[b.t];
        const Icon = k.Icon;
        return (
          <div key={i} className={"aegx-callout" + k.cls}>
            <Icon aria-hidden="true" />
            <p><b>{k.label}: </b>{b.text}</p>
          </div>
        );
      })}
    </div>
  );
}