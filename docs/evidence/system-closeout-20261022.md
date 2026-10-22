# Aegisora system closeout 2026-10-22 08:37

## 1) Git durumu
branch: perf/evaluate-region
HEAD:   29668b4 fix(billing): friendly message when a plan has no Stripe price configured
temiz (git status bos)
origin ile fark (ahead/behind): fatal: ambiguous argument 'HEAD...origin/main': unknown revision or path not in the working tree. Use '--' to separate paths from revisions, like this: 'git <command> [<revision>...] -- [<file>...]'

## 2) Canli site ve guvenlik basliklari
https://www.aegisora.org/en -> 200
  OK   Strict-Transport-Security
  OK   Content-Security-Policy
  OK   X-Frame-Options
  OK   X-Content-Type-Options
  OK   Referrer-Policy
https://www.aegisora.org/de -> 200

## 3) Vercel deploy baglantisi
target	production
status	ÔùÅ Ready
created	Thu Oct 22 2026 08:15:13 GMT+0200 (Central European Summer Time) [22m

## 4) Vercel ortam degiskenleri (yalniz isimler)
NEXT_PUBLIC_SENTRY_DSN                     eyJ2IjoidjIiLCJjIjÔÇĞ         Config    Production                 
STRIPE_WEBHOOK_SECRET                      Hidden                      Secret    Production                  4
STRIPE_SECRET_KEY                          Hidden                      Secret    Production                  4
STRIPE_PRICE_TEAM                          Hidden                      Secret    Production                  4
SUPABASE_SERVICE_ROLE_KEY                  Hidden                      Secret    Production                  4
NEXT_PUBLIC_SUPABASE_ANON_KEY              eyJ2IjoidjIiLCJjIjÔÇĞ         Config    Production                 
NEXT_PUBLIC_SUPABASE_URL                   eyJ2IjoidjIiLCJjIjÔÇĞ         Config    Production                 
SUPABASE_SERVICE_ROLE_KEY                  Hidden                      Secret    Preview                     1
NEXT_PUBLIC_SUPABASE_ANON_KEY              eyJ2IjoidjIiLCJjIjÔÇĞ         Config    Preview                    
NEXT_PUBLIC_SUPABASE_URL                   eyJ2IjoidjIiLCJjIjÔÇĞ         Config    Preview                    
GROQ_API_KEY                               Hidden                      Secret    Preview, Production         8
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY         Hidden                      Secret    Production                  8

## 5) Gizli anahtar sizintisi taramasi (src, docs)
eslesme yok

## 6) Elle kalan adimlar (checklist)

## 7) Sadece sende kalanlar
[ ] Sentry: User/Request/IP bos mu, Prevent Storing of IP Addresses acik, uyari e-postasi geldi mi, test hatalarini Resolve et
[ ] Elle adimlar 10, 12, 14, 17 (12 = davet e-postasi: gelmezse/gecikirse Supabase varsayilan gondericisi sorunu)
[ ] Dashboard > Billing > Pilot dugmesi: 'This plan is not available for self-service checkout yet...' gorunuyor mu
[ ] Opsiyonel: Vercel'den kullanilmayan GROQ_API_KEY sil
