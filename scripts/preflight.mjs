import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = (process.argv[2] || "https://aegisora.org").replace(/\/$/, "");
const viewports = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];
const lines = [];
const log = (s) => { console.log(s); lines.push(s); };

const browser = await chromium.launch();
const open = async (vp) => {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });
  return { ctx, page: await ctx.newPage() };
};

let routes = ["/de", "/de/pricing"];
{
  const { ctx, page } = await open(viewports[0]);
  await page.goto(base + "/de", { waitUntil: "load", timeout: 45000 });
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]")).map((a) => a.getAttribute("href"))
  );
  for (const h of hrefs) {
    if (!h || !h.startsWith("/") || h.startsWith("//")) continue;
    const clean = h.split("#")[0].split("?")[0];
    if (clean && !clean.startsWith("/api") && !routes.includes(clean)) routes.push(clean);
  }
  await ctx.close();
}
routes = routes.slice(0, 20);
log("Base: " + base + " | Sayfa sayisi: " + routes.length);

let problems = 0;
for (const r of routes) {
  for (const vp of viewports) {
    const { ctx, page } = await open(vp);
    const errs = [];
    page.on("pageerror", (e) => errs.push("JS hata: " + e.message.slice(0, 120)));
    page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 120)); });
    page.on("response", (rs) => { if (rs.status() >= 400) errs.push("HTTP " + rs.status() + " " + rs.url().slice(0, 100)); });
    let status = 0;
    try {
      const resp = await page.goto(base + r, { waitUntil: "load", timeout: 45000 });
      status = resp ? resp.status() : 0;
    } catch (e) {
      errs.push("goto: " + e.message.slice(0, 100));
    }
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Reject" }).click({ timeout: 2000 }).catch(() => {});
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total + 800; y += 350) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(1200);
    const res = await page.evaluate(() => {
      const eff = (el) => {
        let o = 1;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
        return o;
      };
      const hidden = [];
      for (const el of document.querySelectorAll("h1,h2,h3,h4,p,li,a,button,img")) {
        const b = el.getBoundingClientRect();
        if (b.width < 20 || b.height < 10) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (el.closest("[aria-hidden='true'],[hidden]")) continue;
        if (eff(el) < 0.1) {
          const txt = (el.textContent || el.getAttribute("alt") || "").trim().replace(/\s+/g, " ").slice(0, 50);
          hidden.push(el.tagName.toLowerCase() + ": " + txt);
        }
      }
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        hidden: hidden.slice(0, 8),
        hiddenCount: hidden.length,
      };
    });
    const bad = status >= 400 || errs.length > 0 || res.hiddenCount > 0 || (vp.mobile && res.overflow > 1);
    if (bad) problems++;
    log((bad ? "[CHECK] " : "[OK]    ") + r + " " + vp.name + " status=" + status + " yukseklik=" + total);
    if (vp.mobile && res.overflow > 1) log("    yatay tasma: " + res.overflow + "px");
    if (res.hiddenCount > 0) log("    kaydirdiktan sonra gorunmeyen " + res.hiddenCount + " oge: " + res.hidden.join(" | "));
    for (const e of errs.slice(0, 5)) log("    " + e);
    await ctx.close();
  }
}
await browser.close();
log("Toplam sorunlu sayfa/gorunum: " + problems);
fs.writeFileSync("docs/preflight.txt", lines.join("\n"), "utf8");
