import fs from 'node:fs';

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
  '/onboarding', '/', '/pricing', '/product', '/docs', '/enterprise', '/login'];
const SHOT_NAMES = { '/dashboard': 'overview', '/dashboard/approvals': 'approvals', '/dashboard/billing': 'billing',
  '/onboarding': 'onboarding', '/': 'home', '/pricing': 'pricing' };

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
  const isDark = () => page.evaluate(() => document.documentElement.classList.contains('dark') || document.documentElement.dataset.theme === 'dark');
  if ((await isDark()) !== (theme === 'dark')) {
    const btn = page.locator('button[aria-label*="theme" i], button[aria-label*="mode" i], button[aria-label*="dark" i], button[aria-label*="light" i], button[aria-label*="tema" i]').first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(700); }
  }
  let how = 'gercek-dugme';
  if ((await isDark()) !== (theme === 'dark')) {
    how = 'YEDEK(sinif)';
    await page.evaluate((t) => {
      const d = document.documentElement;
      d.classList.toggle('dark', t === 'dark'); d.dataset.theme = t; d.style.colorScheme = t;
    }, theme);
  }
  const attrs = await page.evaluate(() => {
    const d = document.documentElement;
    return 'class="' + d.className + '" data-theme=' + d.dataset.theme;
  });
  return how + ' ' + attrs;
}

function probeContrast() {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const norm = (c) => {
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const mix = (t, b) => { const a = t[3]; return [t[0] * a + b[0] * (1 - a), t[1] * a + b[1] * (1 - a), t[2] * a + b[2] * (1 - a), 1]; };
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const top = n === document.body || n === document.documentElement;
      if (!top && cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      const c = norm(cs.backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 0.99) break; }
    }
    let base = getComputedStyle(document.documentElement).colorScheme.indexOf('dark') >= 0 ? [10, 10, 14, 1] : [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) base = mix(layers[i], base);
    return base;
  };
  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; const txt = (t.nodeValue || '').trim();
    if (txt.length < 2) continue;
    const el = t.parentElement;
    if (!el || seen.has(el)) continue;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].indexOf(el.tagName) >= 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    seen.add(el);
    let op = 1;
    for (let n = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
    if (op < 0.2) continue;
    const bg = bgOf(el); if (!bg) continue;
    const fg = norm(cs.color); const fa = fg[3] * op;
    if (fa < 0.05) continue;
    const eff = mix([fg[0], fg[1], fg[2], fa], bg);
    const l1 = lum(eff), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (ratio < 3) out.push({ tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') || '').slice(0, 90), txt: txt.slice(0, 32), ratio: Math.round(ratio * 10) / 10 });
    if (out.length >= 25) break;
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
  await page.waitForTimeout(3500);
  for (const theme of ['dark', 'light']) {
    const how = await setTheme(page, theme);
    await page.waitForTimeout(900);
    const name = SHOT_NAMES[p];
    if (name) await page.screenshot({ path: 'scripts/shots/' + name + '-' + theme + '.png' });
    const low = await page.evaluate(probeContrast).catch(() => []);
    cr += '\n[' + theme + '] ' + p + '  (' + how + ')  dusuk kontrast: ' + low.length + '\n';
    for (const x of low) cr += '   ' + x.ratio + '  <' + x.tag + '> "' + x.txt + '"  class="' + x.cls + '"\n';
    if (p === '/dashboard') {
      const v = await page.evaluate(() => {
        const s = getComputedStyle(document.querySelector('main') || document.body);
        return s.getPropertyValue('--surface-1') + ' | ' + s.getPropertyValue('--primary');
      });
      console.log('TOKEN(' + theme + '): ' + v);
    }
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