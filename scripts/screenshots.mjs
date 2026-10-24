import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base = (process.argv[2] || "https://aegisora.org").replace(/\/$/, "");
const locale = process.argv[3] || "de";
const mode = process.argv[4] || "key";
const appDir = path.join(process.cwd(), "src", "app");
const outDir = path.join(process.cwd(), "docs", "screenshots");
const reportPath = path.join(process.cwd(), "docs", "screenshot-report.txt");
fs.mkdirSync(outDir, { recursive: true });

function walk(dir, segs = []) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "api") continue;
      if (e.name.startsWith("(") && e.name.endsWith(")")) out = out.concat(walk(full, segs));
      else if (e.name === "[locale]") out = out.concat(walk(full, [...segs, locale]));
      else if (/^[\[@_]/.test(e.name)) continue;
      else out = out.concat(walk(full, [...segs, e.name]));
    } else if (e.name === "page.tsx") {
      out.push("/" + segs.join("/"));
    }
  }
  return out;
}

let routes = [...new Set(walk(appDir))].sort();
if (mode === "key") {
  const keyRe = new RegExp("^/" + locale + "(/(pricing|product|docs|login|signup|security|enterprise|developers|about|contact|trust|support))?$");
  routes = routes.filter((r) => keyRe.test(r));
}

const viewports = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

let browser = await chromium.launch();
const lines = [`Base: ${base}  Locale: ${locale}  Mode: ${mode}  Routes: ${routes.length}`, ""];

for (const route of routes) {
  for (const vp of viewports) {
    const problems = [];
    let ctx = null;
    try {
      if (!browser.isConnected()) browser = await chromium.launch();
      ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.mobile ? 2 : 1,
        isMobile: vp.mobile,
      });
      const page = await ctx.newPage();
      page.on("console", (m) => { if (m.type() === "error") problems.push("console error: " + m.text().slice(0, 160)); });
      page.on("requestfailed", (r) => problems.push("request failed: " + r.url().slice(0, 120)));
      page.on("response", (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ` + r.url().slice(0, 120)); });
      await page.goto(base + route, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(1500);
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            window.scrollTo(0, y);
            y += 500;
            if (y < document.documentElement.scrollHeight + 500) setTimeout(step, 100);
            else { window.scrollTo(0, 0); setTimeout(resolve, 600); }
          };
          step();
        });
      });
      const m = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        iw: window.innerWidth,
        p: location.pathname,
      }));
      if (m.sw > m.iw + 1) problems.push(`horizontal overflow: content ${m.sw}px in ${m.iw}px viewport`);
      if (m.p !== route) problems.push("redirected to " + m.p);
      const name = (route === "/" ? "home" : route.slice(1).replace(/\//g, "_")) + "_" + vp.name + ".png";
      await page.screenshot({ path: path.join(outDir, name), fullPage: true });
    } catch (err) {
      problems.push("error: " + String(err).slice(0, 160));
    } finally {
      if (ctx) await ctx.close().catch(() => {});
    }
    lines.push(`${route} [${vp.name}] ${problems.length ? "\n   - " + [...new Set(problems)].join("\n   - ") : "OK"}`);
    fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
  }
}

await browser.close().catch(() => {});
console.log("Done. Report: docs\\screenshot-report.txt, images: docs\\screenshots");
