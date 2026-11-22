const BARS = [30, 44, 38, 52, 61, 48, 70, 66, 58, 76, 64, 82, 72, 90, 78, 68, 84, 74, 60, 70, 56, 48, 40, 34];
const ROWS: [string, string, string][] = [
  ["crm.read_ticket", "support-agent", "ALLOW"],
  ["files.export salary.csv", "hr-agent", "ESCALATE"],
  ["customers.delete bulk", "billing-agent", "BLOCK"],
  ["email.send", "support-agent", "ALLOW"],
];

/** Static example of the Aegisora Console. Not live data. */
export function ConsolePreview({ de }: { de: boolean }) {
  const nav = de
    ? ["Dashboard", "Freigaben", "Agenten", "Richtlinien", "Nachweise", "Live-Aktivit\u00e4t"]
    : ["Dashboard", "Approvals", "Agents", "Policies", "Evidence", "Live activity"];
  const stats = de
    ? [["Entscheidungen (24h)", "1.248"], ["Blockiert (24h)", "37"], ["Offene Freigaben", "3"], ["Agenten", "6"]]
    : [["Decisions (24h)", "1,248"], ["Blocked (24h)", "37"], ["Pending approvals", "3"], ["Agents", "6"]];
  return (
    <div className="aegx-cp-wrap">
      <div className="aegx-cp" role="img" aria-label={de ? "Beispielansicht der Aegisora Console" : "Example view of the Aegisora Console"}>
        <aside className="aegx-cp__side">
          <div className="aegx-cp__brand"><i className="aegx-logo__mark" style={{ width: 24, height: 17 }} /><span>Aegisora<br />Console</span></div>
          {nav.map((n, i) => (<span key={n} className={"aegx-cp__nav" + (i === 0 ? " is-on" : "")}>{n}</span>))}
        </aside>
        <div className="aegx-cp__main">
          <div className="aegx-cp__top"><span>my-workspace</span><span className="aegx-cp__pill">Ctrl K</span></div>
          <p className="aegx-cp__h">{de ? "Hallo, Team" : "Hello, team"}</p>
          <div className="aegx-cp__stats">
            {stats.map(([l, v]) => (<div key={l}><small>{l}</small><b>{v}</b></div>))}
          </div>
          <div className="aegx-cp__grid">
            <div className="aegx-cp__card">
              <small>{de ? "Entscheidungen pro Stunde" : "Decisions per hour"}</small>
              <div className="aegx-cp__bars">
                {BARS.map((b, i) => (<i key={i} style={{ height: b + "%", animationDelay: i * 90 + "ms" }} />))}
              </div>
            </div>
            <div className="aegx-cp__card">
              <small>{de ? "Letzte Entscheidungen" : "Recent decisions"}</small>
              {ROWS.map(([a, g, v]) => (
                <div key={a} className="aegx-cp__row">
                  <span><b className="aegx-mono">{a}</b><em>{g}</em></span>
                  <span className={"aegx-v aegx-v--" + v.toLowerCase()}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="aegx-cp__cap">{de ? "Beispielansicht mit Demodaten." : "Example view with sample data."}</p>
    </div>
  );
}