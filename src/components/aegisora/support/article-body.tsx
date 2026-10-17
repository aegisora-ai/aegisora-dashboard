import type { Block } from "@/lib/support-content";

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (b.t === "h") return <h2 key={i} className="aeg-display pt-4 text-2xl sm:text-3xl">{b.text}</h2>;
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
        return (
          <div key={i} className="rounded-xl border border-border bg-surface-3 p-4 text-sm leading-6">
            <span className="font-semibold">Note: </span>{b.text}
          </div>
        );
      })}
    </div>
  );
}