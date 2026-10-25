import { test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), ".enterprise", "zp-light");

const PAGES = [
  { name: "pricing", url: "/pricing" },
  { name: "docs", url: "/docs" },
  { name: "docs-quickstart", url: "/docs/quickstart" },
  { name: "docs-technical", url: "/docs/technical" },
  { name: "trust", url: "/trust" },
  { name: "trust-privacy", url: "/trust/privacy" },
  { name: "trust-subprocessors", url: "/trust/subprocessors" },
  { name: "about", url: "/about" },
  { name: "proof", url: "/proof" },
  { name: "blog", url: "/blog" },
  { name: "terms", url: "/terms" },
];

async function audit(page: Page) {
  return page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = 1; cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;
    const cache = new Map<string, number[]>();
    const rgba = (c: string): number[] => {
      const hit = cache.get(c);
      if (hit) return hit;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      const v = [d[0], d[1], d[2], d[3] / 255];
      cache.set(c, v);
      return v;
    };
    const lum = (r: number, g: number, b: number) => {
      const f = (x: number) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const effectiveBg = (el: Element): number[] => {
      const layers: number[][] = [];
      let n: Element | null = el;
      while (n) {
        const st = getComputedStyle(n);
        let bg = rgba(st.backgroundColor);
        if (bg[3] === 0 && st.backgroundImage.includes("gradient")) {
          const stops = (st.backgroundImage.match(/rgba?\([^)]*\)/g) || []).map((c) => rgba(c));
          if (stops.length) bg = stops.reduce((a, b) => (lum(a[0], a[1], a[2]) >= lum(b[0], b[1], b[2]) ? a : b));
        }
        if (bg[3] > 0) layers.push(bg);
        if (bg[3] >= 0.99) break;
        n = n.parentElement;
      }
      let out = [255, 255, 255];
      for (let i = layers.length - 1; i >= 0; i--) {
        const l = layers[i];
        out = [0, 1, 2].map((k) => l[k] * l[3] + out[k] * (1 - l[3]));
      }
      return out;
    };
    const seen = new Set<string>();
    const bad: { ratio: number; sel: string; text: string; color: string; bg: string }[] = [];
    document.querySelectorAll("body *").forEach((el) => {
      const hasText = Array.from(el.childNodes).some((c) => c.nodeType === 3 && (c.textContent || "").trim().length > 1);
      if (!hasText) return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.1) return;
      const fg = rgba(cs.color);
      const bg = effectiveBg(el);
      const L1 = lum(fg[0], fg[1], fg[2]);
      const L2 = lum(bg[0], bg[1], bg[2]);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (ratio >= 3) return;
      const cls = (typeof el.className === "string" ? el.className : "").trim().split(/\s+/).slice(0, 4).join(".");
      const sel = el.tagName.toLowerCase() + (cls ? "." + cls : "");
      const text = (el.textContent || "").trim().slice(0, 40);
      const key = sel + "|" + Math.round(ratio * 10);
      if (seen.has(key)) return;
      seen.add(key);
      bad.push({
        ratio: Math.round(ratio * 100) / 100,
        sel: sel.slice(0, 90),
        text,
        color: "rgb(" + fg.slice(0, 3).map(Math.round).join(",") + ")",
        bg: "rgb(" + bg.map(Math.round).join(",") + ")",
      });
    });
    bad.sort((a, b) => a.ratio - b.ratio);
    return bad.slice(0, 40);
  });
}



test.describe("zp light audit", () => {
  test.skip(!process.env.ZP_LIGHT, "ZP_LIGHT=1 ile calisir");

  test("measure zp pages in light theme", async ({ browser }) => {
    test.setTimeout(900_000);
    fs.mkdirSync(outDir, { recursive: true });
    const report: Record<string, unknown> = {};
    const viewports = [
      { n: "desktop", w: 1440, h: 900 },
      { n: "mobile", w: 390, h: 844 },
    ];
    for (const vp of viewports) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      for (const p of PAGES) {
        const key = p.name + "-" + vp.n;
        try {
          await page.goto(p.url, { waitUntil: "domcontentloaded" });
          await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
          await page.waitForTimeout(1500);
          const rej = page.getByRole("button", { name: /^reject$/i }).first();
          if (await rej.isVisible().catch(() => false)) await rej.click({ timeout: 3000 }).catch(() => {});
          await page.evaluate(() => document.documentElement.classList.remove("dark"));
          await page.waitForTimeout(500);
          const info = await page.evaluate(() => ({
            dark: document.documentElement.classList.contains("dark"),
            body: getComputedStyle(document.body).backgroundColor,
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          }));
          await page.screenshot({ path: path.join(outDir, key + ".png"), fullPage: true });
          report[key] = { ...info, lowContrast: await audit(page) };
        } catch (e) {
          report[key] = { error: String(e).slice(0, 200) };
        }
        fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
      }
      await ctx.close();
    }
  });
});