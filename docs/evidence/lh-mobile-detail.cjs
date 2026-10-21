const fs = require("fs");
const f = process.argv[2];
if (!fs.existsSync(f)) { console.log("yok: " + f); process.exit(0); }
const r = JSON.parse(fs.readFileSync(f, "utf8"));
const A = r.audits;
const items = (id) => (A[id] && A[id].details && Array.isArray(A[id].details.items)) ? A[id].details.items : [];
const nodeOf = (i) => (i.node && (i.node.snippet || i.node.selector)) ? String(i.node.snippet || i.node.selector).slice(0, 180) : "";
console.log("skor: " + Object.values(r.categories).map(c => c.id + "=" + Math.round(c.score * 100)).join(" "));
console.log("metrikler: " + ["first-contentful-paint","largest-contentful-paint","total-blocking-time","speed-index"].filter(k => A[k]).map(k => k + " " + A[k].displayValue).join(" | "));
console.log("--- LCP elemani ---");
const lcpEl = A["largest-contentful-paint-element"];
if (lcpEl && lcpEl.details) {
  const flat = [];
  (function walk(x) { if (!x) return; if (Array.isArray(x)) x.forEach(walk); else if (x.items) walk(x.items); else flat.push(x); if (x.subItems) walk(x.subItems); })(lcpEl.details.items);
  flat.slice(0, 5).forEach(i => console.log("  " + (nodeOf(i) || (i.phase ? i.phase + " " + Math.round(i.timing) + "ms" : JSON.stringify(i).slice(0, 200)))));
} else console.log("  -");
console.log("--- LCP alt asamalari ---");
const lb = A["lcp-breakdown-insight"];
if (lb && lb.details && Array.isArray(lb.details.items)) {
  (function walk(x) { for (const i of x) { if (i && i.subpart) console.log("  " + i.label + ": " + Math.round(i.duration) + " ms"); if (i && Array.isArray(i.items)) walk(i.items); } })(lb.details.items);
} else console.log("  -");
console.log("--- render-blocking ---");
for (const id of ["render-blocking-insight","render-blocking-resources"]) { const it = items(id); if (it.length) { it.slice(0, 6).forEach(i => console.log("  " + (i.url || JSON.stringify(i).slice(0, 160)) + "  " + Math.round(i.wastedMs || i.duration || 0) + "ms")); break; } }
console.log("--- kullanilmayan JS (ilk 8) ---");
items("unused-javascript").slice(0, 8).forEach(i => console.log("  " + String(i.url).replace("https://www.aegisora.org", "") + "  toplam " + Math.round(i.totalBytes / 1024) + " KiB, bos " + Math.round(i.wastedBytes / 1024) + " KiB"));
console.log("--- JS calisma suresi (ilk 8) ---");
items("bootup-time").slice(0, 8).forEach(i => console.log("  " + String(i.url).replace("https://www.aegisora.org", "").slice(0, 90) + "  toplam " + Math.round(i.total) + "ms, script " + Math.round(i.scripting) + "ms"));
console.log("--- en agir istekler (ilk 10) ---");
items("network-requests").filter(i => i.transferSize > 0).sort((a, b) => b.transferSize - a.transferSize).slice(0, 10).forEach(i => console.log("  " + Math.round(i.transferSize / 1024) + " KiB  " + String(i.url).replace("https://www.aegisora.org", "").slice(0, 110)));
console.log("toplam bayt: " + (A["total-byte-weight"] ? A["total-byte-weight"].displayValue : "-"));
