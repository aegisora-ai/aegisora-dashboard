# Pilot canli uctan uca test (production)
Not: Bu test production Supabase'e gercek kayit yazar. Kendi kontrol ettigin bir test e-postasi kullan, bitince test kullanicisini ve workspace'i sil.
Her adimda ekran goruntusu al, dosya adini "Kanit" sutununa yaz. Sonucu OK / HATA / ATLANDI olarak isaretle.

| # | Adim | Beklenen | Kanit | Sonuc |
|---|------|----------|-------|-------|
| 1 | /signup ile yeni hesap ac | Dogrulama e-postasi gelir (dakika sayisini not et) | | |
| 2 | E-postadaki baglantiya tikla | Hesap dogrulanir, giris acilir | | |
| 3 | Giris yap, MFA (TOTP) kur | QR kod gorunur, kod kabul edilir | | |
| 4 | Cikis yap, MFA koduyla tekrar gir | Kodsuz giris olmaz | | |
| 5 | Onboarding: workspace, ajan, ilk politika (ESCALATE) | Uc kayit olusur, dashboard'da gorunur | | |
| 6 | API anahtari olustur | Anahtar bir kez gosterilir | | |
| 7 | /api/v1/evaluate cagrisi (ESCALATE tetikleyen eylem) | Karar ESCALATE, onay kaydi pending | | |
| 8 | Dashboard > Approvals: onayla (gerekce yaz) | Durum approved, kayit cozumlenir | | |
| 9 | /api/v1/decisions/{id} sorgusu | may_execute true | | |
| 10 | Ayni onayi ikinci kez cozmeyi dene | 409 hatasi | | |
| 11 | Dashboard > Evidence | Zincir kayitlari gorunur | | |
| 12 | Team: uye davet et, kabul et | Uye listede, yetkiler dogru | | |
| 13 | /de sayfalari ve Impressum | Dil dogru, icerik eksiksiz | | |
| 14 | Telefonda PWA kur (iOS Safari, Android Chrome) | Ikon kirpilmaz, uygulama acilir, giris calisir | | |
| 15 | Pricing > checkout (Stripe canli modda) | Gercek kartla odeme, webhook plani gunceller | | |
| 16 | Billing portal, iptal, iade | Portal acilir, iade gorunur | | |
| 17 | Test kullanicisini ve workspace'i sil | Veri kalmaz | | |
