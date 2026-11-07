import fs from 'node:fs';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import('@playwright/test')); }

const BASE = 'https://aegisora.org';
const PUBLIC = ['/', '/about', '/blog', '/changelog', '/contact', '/demo', '/developers', '/developers/quickstart',
  '/docs', '/docs/quickstart', '/docs/technical', '/enterprise', '/evidence', '/impressum', '/legal/dpa', '/pilot',
  '/pricing', '/product', '/product/approvals', '/product/decisions', '/product/evidence', '/product/policies',
  '/product/runtime', '/proof', '/resources', '/security', '/solutions', '/support', '/terms', '/trust',
  '/trust/privacy', '/trust/subprocessors', '/login', '/signup'];
const DASH = ['/dashboard', '/dashboard/activity', '/dashboard/agents', '/dashboard/api-keys', '/dashboard/approvals',
  '/dashboard/audit', '/dashboard/billing', '/dashboard/decisions', '/dashboard/evidence', '/dashboard/identity',
  '/dashboard/incidents', '/dashboard/integrations', '/dashboard/policies', '/dashboard/providers', '/dashboard/risk',
  '/dashboard/settings', '/dashboard/team', '/dashboard/traces', '/dashboard/webhooks', '/dashboard/workspace'];

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

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 850 } });
const page = await ctx.newPage();

for (const loc of ['', '/de']) {
  for (const p of PUBLIC) await check(page, loc + (p === '/' ? (loc ? '' : '/') : p));
}

console.log('\n>>> Simdi acilan pencerede aegisora.org/login ekraninda GIRIS YAP (5 dk suren var).');
await page.goto(BASE + '/login');
await page.waitForURL(/dashboard/, { timeout: 300000 });
await page.waitForTimeout(3000);

for (const loc of ['', '/de']) {
  for (const p of DASH) await check(page, loc + p);
}

await browser.close();

const bad = results.filter((r) => r.flags.length || r.errs.length);
let report = 'TOPLAM ' + results.length + ' sayfa, SORUNLU ' + bad.length + '\n\n';
for (const r of bad) {
  report += r.path + '  [' + r.status + '] ' + r.flags.join(',') + '\n';
  for (const e of r.errs.slice(0, 4)) report += '    - ' + e + '\n';
}
fs.writeFileSync('scripts/site-audit-report.txt', report, 'utf8');
console.log('\n' + report);