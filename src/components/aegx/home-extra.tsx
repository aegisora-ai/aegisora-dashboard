import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { POSTS } from "@/lib/blog-posts";
import { BlogCover } from "./blog-cover";
import { ConsolePreview } from "./console-preview";
import { Cell, Cells, Sec, SectionHead } from "./ui";

export function HomePreview({ locale }: { locale: string }) {
  const de = locale === "de";
  return (
    <Sec flush>
      <div className="aegx-pad aegx-pad--head">
        <SectionHead
          eyebrow={de ? "Konsole" : "Console"}
          title={de ? "Jede Entscheidung" : "Every decision,"}
          dim={de ? "auf einen Blick." : "at a glance."}
          intro={de ? "Freigaben, Richtlinien, Agenten und Nachweise in einer ruhigen, schnellen Konsole." : "Approvals, policies, agents and evidence in one calm, fast console."}
        />
      </div>
      <div className="aegx-sbody"><ConsolePreview de={de} /></div>
    </Sec>
  );
}

export async function HomeMore({ locale }: { locale: string }) {
  const de = locale === "de";
  const tp = await getTranslations({ locale, namespace: "Pricing" });
  const tb = await getTranslations({ locale, namespace: "Blog" });
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(de ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const use = de
    ? [
        { title: "Plattform-Teams", body: "Ein Richtlinien-Tor vor jedem Agenten, unabh\u00e4ngig vom Framework." },
        { title: "Security-Teams", body: "Riskante Aktionen blockieren, bevor sie Produktivsysteme erreichen." },
        { title: "Compliance und Audit", body: "Jede Entscheidung als pr\u00fcfbarer Nachweis, exportierbar f\u00fcr Audits." },
        { title: "KI-Produktteams", body: "Agenten ausliefern und Menschen genau dort einbinden, wo es z\u00e4hlt." },
      ]
    : [
        { title: "Platform teams", body: "One policy gate in front of every agent, whatever the framework." },
        { title: "Security teams", body: "Block risky actions before they reach production systems." },
        { title: "Compliance and audit", body: "Every decision as reviewable evidence, exportable for audits." },
        { title: "AI product teams", body: "Ship agents and bring people in exactly where it matters." },
      ];
  const faq: [string, string][] = ["1", "2", "3", "4", "5"].map((n) => [tp("q" + n), tp("a" + n)]);
  const posts = POSTS.slice(0, 3);
  return (
    <>
      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={de ? "F\u00fcr wen" : "Built for"} title={de ? "Teams, die Agenten" : "Teams that run agents"} dim={de ? "in Produktion bringen." : "in production."} />
        </div>
        <Cells n={4}>
          {use.map((u) => (<Cell key={u.title} title={u.title}>{u.body}</Cell>))}
        </Cells>
      </Sec>

      {posts.length > 0 ? (
        <Sec flush>
          <div className="aegx-pad aegx-pad--head">
            <SectionHead eyebrow="Blog" title={de ? "Neueste" : "Latest"} dim={de ? "Beitr\u00e4ge." : "posts."} />
          </div>
          <div className="aegx-cells aegx-cells--3">
            {posts.map((p) => (
              <Link key={p.slug} href={"/blog/" + p.slug} className="aegx-cell aegx-post">
                <div className="aegx-post__cover"><BlogCover seed={p.slug} label={p.category} /></div>
                <div className="aegx-post__b">
                  <span className="aegx-post__cat">{p.category}</span>
                  <h3 className="aegx-h3">{p.title}</h3>
                  <span className="aegx-post__meta">{fmt(p.date) + " \u00b7 " + tb("minRead", { n: p.readMinutes })}</span>
                </div>
              </Link>
            ))}
          </div>
        </Sec>
      ) : null}

      <Sec>
        <SectionHead title={tp("faqTitle")} />
        <div className="aegx-faq" style={{ marginTop: 40 }}>
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span aria-hidden="true">+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </Sec>
    </>
  );
}