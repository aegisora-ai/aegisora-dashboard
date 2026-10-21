const fs = require("fs");
const flat = (items) => { const o = []; if (!Array.isArray(items)) return o; for (const i of items) { if (!i) continue; if (Array.isArray(i.items)) o.push(...flat(i.items)); else o.push(i); if (i.subItems && Array.isArray(i.subItems.items)) o.push(...flat(i.subItems.items)); } return o; };
const rect = (n) => (n && n.boundingRect) ? (" rect(top=" + n.boundingRect.top + ",h=" + n.boundingRect.height + ")") : "";
const line = (i) => { const p = []; if (i.node && i.node.snippet) p.push(i.node.snippet); else if (i.node && i.node.selector) p.push(i.node.selector); if (i.url) p.push(i.url); if (i.cause) p.push("cause=" + i.cause); if (typeof i.score === "number") p.push("shift=" + i.score.toFixed(3)); const s = p.length ? p.join(" | ") : JSON.stringify(i); return (s + rect(i.node)).slice(0, 300); };
for (const f of process.argv.slice(2)) {
  if (!fs.existsSync(f)) { console.log("yok: " + f); continue; }
  const r = JSON.parse(fs.readFileSync(f, "utf8"));
  const cats = Object.values(r.categories).map(c => c.id + "=" + Math.round(c.score * 100)).join(" ");
  console.log("--- " + f.split("\\").pop() + "   " + cats);
  console.log("  " + ["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","speed-index"].filter(id => r.audits[id]).map(id => id + ": " + r.audits[id].displayValue).join(" | "));
  for (const id of ["layout-shifts","unsized-images","color-contrast"]) {
    const a = r.audits[id];
    if (!a || !a.details) { console.log("  [" + id + "] -"); continue; }
    const it = flat(a.details.items);
    console.log("  [" + id + "] " + it.length);
    it.slice(0, 7).forEach(i => console.log("     " + line(i)));
  }
}
