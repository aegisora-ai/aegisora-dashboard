import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import('@playwright/test')); }

const BASE = process.env.AUDIT_BASE || 'https://aegisora.org';
const PUBLIC = ['/', '/about', '/blog', '/changelog', '/contact', '/demo', '/developers', '/developers/quickstart',
  '/docs', '/docs/quickstart', '/docs/technical', '/enterprise', '/evidence', '/impressum', '/legal/dpa', '/pilot',
  '/pricing', '/product', '/product/approvals', '/product/decisions', '/product/evidence', '/product/policies',
  '/product/runtime', '/proof', '/resources', '/security', '/solutions', '/support', '/terms', '/trust',
  '/trust/privacy', '/trust/subprocessors', '/login', '/signup'];
const DASH = ['/dashboard', '/dashboard/activity', '/dashboard/agents', '/dashboard/api-keys', '/dashboard/approvals',
  '/dashboard/audit', '/dashboard/billing', '/dashboard/decisions', '/dashboard/evidence', '/dashboard/identity',
  '/dashboard/incidents', '/dashboard/policies', '/dashboard/settings', '/dashboard/team', '/dashboard/traces',
  '/dashboard/webhooks', '/dashboard/workspace'];
const PROBE = ['/dashboard', '/dashboard/approvals', '/dashboard/billing', '/dashboard/agents', '/dashboard/policies',
  '/dashboard/evidence', '/dashboard/team', '/dashboard/settings', '/dashboard/api-keys', '/dashboard/webhooks',
  '/onboarding', '/', '/pricing', '/product', '/docs', '/enterprise'];

const results = [];

async function check(page, path) {
  const errs = [];
  const onC = (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); };
  const onP = (e) => errs.push('pageerror: ' + String(e.message).slice(0, 200));
  const onR = (r) => {
    const u = r.url();
    if (r.status() >= 400 && u.startsWith(BASE) && !u.includes('/_vercel')) errs.push('http ' + r.status() + ' ' + u.replace(BASE, ''));
  };
  page.on('console', onC); page.on('pageerror', onP); page.on('response', onR);
  let status = 0;
  try {
    const resp = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = resp ? resp.status() : 0;
    await page.waitForTimeout(2500);
  } catch (e) { errs.push('nav: ' + String(e.message).slice(0, 120)); }
  const info = await page.evaluate(() => ({
    title: document.title,
    text: document.body ? document.body.innerText : '',
  })).catch(() => ({ title: '', text: '' }));
  page.off('console', onC); page.off('pageerror', onP); page.off('response', onR);
  const flags = [];
  if (info.text.includes('Something went wrong')) flags.push('CRASH');
  if (info.text.length < 200) flags.push('EMPTY');
  if (/404|could not be found|not found/i.test(info.title + ' ' + info.text.slice(0, 300))) flags.push('404');
  results.push({ path, status, flags, errs: [...new Set(errs)] });
  console.log((flags.length || errs.length ? 'PROBLEM ' : 'ok      ') + path);
}

async function setTheme(page, theme) {
  const isDark = () => page.evaluate(() => document.documentElement.classList.contains('dark'));
  if ((await isDark()) !== (theme === 'dark')) {
    const btn = page.locator('button[aria-label*="theme" i], button[aria-label*="mode" i], button[aria-label*="dark" i], button[aria-label*="light" i], button[aria-label*="tema" i]').first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(700); }
  }
  let how = 'gercek-dugme';
  if ((await isDark()) !== (theme === 'dark')) {
    how = 'YEDEK(sinif)';
    await page.evaluate((t) => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
  }
  return how;
}

async function settle(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 700));
    await Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  }).catch(() => {});
}

async function axeCheck(page) {
  const res = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  const out = [];
  const seen = new Set();
  for (const v of res.violations) for (const n of v.nodes) {
    const d = (n.any && n.any[0] && n.any[0].data) || {};
    const key = String(n.target[0]) + d.contrastRatio;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      ratio: d.contrastRatio, need: d.expectedContrastRatio, fg: d.fgColor, bg: d.bgColor,
      sel: String(n.target[0]).slice(0, 110),
      html: String(n.html).replace(/\s+/g, ' ').slice(0, 110),
    });
  }
  return out;
}

const ctx = await chromium.launchPersistentContext('scripts/.aeg-profile', {
  headless: false,
  viewport: { width: 1366, height: 850 },
});
const page = ctx.pages()[0] || (await ctx.newPage());

await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.waitForTimeout(3000);
if (!/^\/(de\/)?dashboard/.test(new URL(page.url()).pathname)) {
  console.log('\n>>> Acilan pencerede giris yap (10 dk suren var). Dashboard acilinca pencereye dokunma.');
  await page.goto(BASE + '/login');
  await page.waitForURL((u) => /^\/(de\/)?dashboard/.test(u.pathname), { timeout: 600000 });
  await page.waitForTimeout(3000);
}

for (const loc of ['', '/de']) for (const p of DASH) await check(page, loc + p);

fs.mkdirSync('scripts/shots', { recursive: true });
let cr = '';
for (const p of PROBE) {
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(3000);
  for (const theme of ['dark', 'light']) {
    const how = await setTheme(page, theme);
    await page.waitForTimeout(900);
    await settle(page);
    const slug = p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-');
    await page.screenshot({ path: 'scripts/shots/' + slug + '-' + theme + '.png' });
    const low = await axeCheck(page).catch((e) => [{ ratio: 0, need: 0, fg: '', bg: '', sel: 'axe hata', html: String(e.message).slice(0, 100) }]);
    cr += '\n[' + theme + '] ' + p + '  (' + how + ')  axe sorun: ' + low.length + '\n';
    for (const x of low.slice(0, 12)) cr += '   ' + x.ratio + '/' + x.need + '  fg ' + x.fg + '  bg ' + x.bg + '  ' + x.sel + '  ' + x.html + '\n';
  }
  console.log('olculdu: ' + p);
}
fs.writeFileSync('scripts/contrast-report.txt', cr, 'utf8');

for (const loc of ['', '/de']) for (const p of PUBLIC) await check(page, loc + (p === '/' ? (loc ? '' : '/') : p));

await ctx.close();

const bad = results.filter((r) => r.flags.length || r.errs.length);
let report = 'TOPLAM ' + results.length + ' sayfa, SORUNLU ' + bad.length + '\n\n';
for (const r of bad) {
  report += r.path + '  [' + r.status + '] ' + r.flags.join(',') + '\n';
  for (const e of r.errs.slice(0, 4)) report += '    - ' + e + '\n';
}
fs.writeFileSync('scripts/site-audit-report.txt', report, 'utf8');
console.log('\n' + report);