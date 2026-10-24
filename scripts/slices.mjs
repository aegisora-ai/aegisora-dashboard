import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base = (process.argv[2] || "https://aegisora.org").replace(/\/$/, "");
const routes = [{ name: "home", url: "/de" }, { name: "pricing", url: "/de/pricing" }];
const viewports = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];
const outDir = path.join(process.cwd(), "docs", "slices");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const r of routes) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.mobile ? 2 : 1,
      isMobile: vp.mobile,
    });
    const page = await ctx.newPage();
    await page.goto(base + r.url, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Reject" }).click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    let y = 0;
    let i = 1;
    while (i <= 14) {
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      if (y >= total) break;
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(1200);
      const file = `${r.name}_${vp.name}_${String(i).padStart(2, "0")}.png`;
      await page.screenshot({ path: path.join(outDir, file) });
      y += vp.height - 60;
      i++;
    }
    await ctx.close();
  }
}
await browser.close();
console.log("Done. Images: docs\\slices");
