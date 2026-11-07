import fs from 'node:fs';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import('@playwright/test')); }

const BASE = process.env.AUDIT_BASE || 'https://aegisora.org';
const PATHS = ['/', '/pricing', '/product', '/security', '/de', '/de/pricing'];
const SIZES = [{ name: 'desktop', width: 1366, height: 850 }, { name: 'mobile', width: 390, height: 800 }];
const lines = [];
let fails = 0;

const browser = await chromium.launch({ headless: false });
for (const s of SIZES) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
  for (const p of PATHS) {
    if (s.name === 'mobile' && p !== '/' && p !== '/pricing') continue;
    let status = 0;
    try {
      const r = await page.goto(BASE + p, { waitUntil: 'load', timeout: 45000 });
      status = r ? r.status() : 0;
    } catch { status = 0; }
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const out = [];
      for (const scope of ['header', 'footer']) {
        const img = document.querySelector(scope + ' img[data-logo]');
        if (!img) { out.push({ scope, ok: false, why: 'logo yok' }); continue; }
        const b = img.getBoundingClientRect();
        const st = getComputedStyle(img);
        const ok = img.complete && img.naturalWidth > 0 && b.width >= 8 && b.height >= 8 && st.visibility !== 'hidden' && st.display !== 'none' && Number(st.opacity) > 0.5;
        out.push({ scope, ok, why: ok ? '' : 'yuklenmedi veya gorunmuyor', w: Math.round(b.width), h: Math.round(b.height) });
      }
      const root = document.querySelector('.aegx');
      const bg = root ? getComputedStyle(root).backgroundColor : 'yok';
      return { out, bg };
    }).catch(() => ({ out: [], bg: '' }));
    if (status !== 200) { fails++; lines.push('FAIL ' + s.name + ' ' + p + ' http ' + status); }
    if (info.bg !== 'rgb(0, 0, 0)') { fails++; lines.push('FAIL ' + s.name + ' ' + p + ' zemin siyah degil: ' + info.bg); }
    for (const r of info.out) {
      if (!r.ok) { fails++; lines.push('FAIL ' + s.name + ' ' + p + ' ' + r.scope + ' ' + r.why); }
      else lines.push('ok   ' + s.name + ' ' + p + ' ' + r.scope + ' logo ' + r.w + 'x' + r.h);
    }
  }
  await page.close();
}
await browser.close();
lines.push(fails ? 'SONUC: ' + fails + ' sorun' : 'SONUC: logo ve zemin temiz');
fs.writeFileSync('scripts/logo-report.txt', lines.join('\n') + '\n');
console.log(lines.join('\n'));