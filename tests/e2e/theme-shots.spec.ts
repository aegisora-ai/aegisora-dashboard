import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const outDir = path.join(process.cwd(), ".enterprise", "theme-shots");

const PAGES = [
  { name: "dashboard", url: "/dashboard" },
  { name: "billing", url: "/dashboard/billing" },
  { name: "team", url: "/dashboard/team" },
  { name: "onboarding", url: "/onboarding" },
];

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const submit = page.locator('button[type="submit"]');
  await page.locator('input[name="email"]').fill(email!);
  await expect(submit).toBeEnabled();
  await submit.click();
  const pw = page.locator('input[name="password"]');
  await expect(pw).toBeVisible();
  await pw.fill(password!);
  await expect(submit).toBeEnabled();
  await submit.click();
  await page.waitForURL(/\/(dashboard|de\/dashboard|onboarding)/, { timeout: 30_000 });
}

async function dismissOverlays(page: Page) {
  for (const re of [/^reject$/i, /^skip$/i]) {
    const b = page.getByRole("button", { name: re }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

async function setTheme(page: Page, theme: "dark" | "light") {
  await dismissOverlays(page);
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  const want = theme === "dark";
  if (isDark !== want) {
    const label = want ? "Switch to dark theme" : "Switch to light theme";
    const btn = page.locator('button[aria-label="' + label + '"]');
    let done = false;
    if (await btn.count()) {
      done = await btn.first().click({ timeout: 5000 }).then(() => true).catch(() => false);
    }
    if (!done) {
      await page.evaluate((d) => document.documentElement.classList.toggle("dark", d), want);
    }
  }
  await page.waitForTimeout(400);
}

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
        const bg = rgba(getComputedStyle(n).backgroundColor);
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

async function ensureWorkspace(page: Page) {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await dismissOverlays(page);
  const name = page.getByLabel(/company or team name/i);
  if (await name.isVisible().catch(() => false)) {
    await name.fill("Temporary theme shots");
    await page.getByRole("button", { name: /create workspace/i }).click({ timeout: 5000 });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(2500);
  }
}

async function captureSteps(page: Page, theme: "dark" | "light", report: Record<string, unknown>, outDir: string) {
  await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await dismissOverlays(page);
  await setTheme(page, theme);
  for (let step = 1; step <= 3; step++) {
    await page.screenshot({ path: path.join(outDir, "onboarding-" + theme + "-s" + step + ".png"), fullPage: true });
    if (theme === "light") report["onboarding-light-s" + step] = { lowContrast: await audit(page) };
    const opt = page.locator("button").filter({ hasNotText: /skip|reject|accept|back|close/i }).first();
    if (!(await opt.isVisible().catch(() => false))) break;
    await opt.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(700);
  }
}
test.describe("theme screenshots", () => {
  test.skip(!process.env.THEME_SHOTS, "THEME_SHOTS=1 ile calisir");
  test.skip(!email || !password, "E2E_EMAIL ve E2E_PASSWORD gerekli");

  test("dark vs light capture and contrast audit", async ({ browser }) => {
    test.setTimeout(600_000);
    fs.mkdirSync(outDir, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const report: Record<string, unknown> = {};

    await login(page);
    await ensureWorkspace(page);

    for (const theme of ["dark", "light"] as const) {
      for (const p of PAGES) {
        const key = p.name + "-" + theme;
        try {
          await page.goto(p.url, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(800);
          await dismissOverlays(page);
          await page.waitForLoadState("networkidle", { timeout: 4_000 }).catch(() => {});
          await setTheme(page, theme);
          const finalUrl = new URL(page.url()).pathname;
          await page.screenshot({ path: path.join(outDir, key + ".png"), fullPage: true });
          const entry: Record<string, unknown> = { finalUrl };
          if (theme === "light") entry.lowContrast = await audit(page);
          report[key] = entry; fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");

          if (p.name === "onboarding") {
            for (let step = 2; step <= 3; step++) {
              const next = page.getByRole("button", { name: /next|continue|weiter|devam|get started/i }).first();
              if (!(await next.isVisible().catch(() => false))) break;
              if (!(await next.isEnabled().catch(() => false))) { report[key + "-step" + step] = "next disabled (secim gerekebilir)"; break; }
              await next.click();
              await page.waitForTimeout(600);
              await page.screenshot({ path: path.join(outDir, key + "-step" + step + ".png"), fullPage: true });
              if (theme === "light") report[key + "-step" + step] = { lowContrast: await audit(page) };
            }
          }
        } catch (e) {
          report[key] = { error: String(e).slice(0, 200) };
        }
      }
    }

    await setTheme(page, "light");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, "dashboard-light-mobile.png"), fullPage: true });
    report["dashboard-light-mobile"] = { lowContrast: await audit(page) };

    fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
    for (const th of ["dark", "light"] as const) { await captureSteps(page, th, report, outDir); }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await dismissOverlays(page);
    await setTheme(page, "light");
    await page.screenshot({ path: path.join(outDir, "dashboard-light-mobile-clean.png"), fullPage: true });
    report["dashboard-light-mobile-clean"] = { lowContrast: await audit(page) };
    fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
    await ctx.close();
  });
});