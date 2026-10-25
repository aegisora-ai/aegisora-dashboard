import Stripe from "stripe";
import { randomBytes } from "node:crypto";

const url = (process.env.AEGISORA_E2E_SUPABASE_URL || "").replace(/\/+$/, "");
const svc = process.env.AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY;
const secret = process.env.STRIPE_WEBHOOK_SECRET;
const base = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3199";
if (!url || !svc || !secret) { console.error("[DURDU] env eksik"); process.exit(2); }
if (!url.includes("daigywopatmznzgaouqo")) { console.error("[DURDU] staging degil"); process.exit(2); }

const H = { apikey: svc, Authorization: "Bearer " + svc, "Content-Type": "application/json", Prefer: "return=representation" };
async function rest(method, path, body) {
  const r = await fetch(url + "/rest/v1/" + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, text };
}
const stripe = new Stripe("sk_test_localdummy");
const rid = randomBytes(4).toString("hex");
const evtId = "evt_test_" + rid, sesId = "cs_test_" + rid;
const checks = [];
const check = (name, ok, detail) => { checks.push(ok); console.log((ok ? "[OK]   " : "[FAIL] ") + name + (detail ? "  " + detail : "")); };

let wsId = null;
try {
  const ws = await rest("POST", "workspaces", { name: "Temporary webhook test", slug: "temporary-webhook-test-" + rid });
  if (ws.status >= 300 || !ws.json || !ws.json[0]) { console.error("[DURDU] test workspace olusturulamadi: " + ws.status + " " + ws.text.slice(0, 300)); process.exit(3); }
  wsId = ws.json[0].id;
  console.log("Test workspace: " + wsId);

  const event = {
    id: evtId, object: "event", type: "checkout.session.completed", livemode: false, api_version: "2024-06-20",
    data: { object: { id: sesId, object: "checkout.session", mode: "payment", payment_status: "paid",
      amount_total: 125000, currency: "usd", customer: "cus_test_" + rid, payment_intent: "pi_test_" + rid,
      client_reference_id: wsId, metadata: { workspace_id: wsId, plan_key: "founder_pilot" } } },
  };
  const payload = JSON.stringify(event);
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret });
  const post = (p, s) => fetch(base + "/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": s, "content-type": "application/json" }, body: p });

  const r1 = await post(payload, sig);
  const j1 = await r1.json().catch(() => ({}));
  check("imzali event kabul", r1.status === 200 && j1.received === true, "HTTP " + r1.status + " " + JSON.stringify(j1).slice(0, 120));

  const pay = await rest("GET", "billing_payments?select=status,plan_key,amount_total&stripe_checkout_session_id=eq." + sesId);
  check("billing_payments paid / founder_pilot", pay.json && pay.json[0] && pay.json[0].status === "paid" && pay.json[0].plan_key === "founder_pilot", pay.text.slice(0, 120));

  const ent = await rest("GET", "workspace_entitlements?select=plan_key,status,billing_mode&workspace_id=eq." + wsId);
  check("entitlement active / one_time_pilot", ent.json && ent.json[0] && ent.json[0].status === "active" && ent.json[0].billing_mode === "one_time_pilot", ent.text.slice(0, 140));

  const lim = await rest("GET", "plan_limits?select=plan_key,max_decisions_per_month,max_agents,max_members&plan_key=eq.founder_pilot");
  check("plan_limits founder_pilot satiri var", lim.json && lim.json.length === 1, lim.text.slice(0, 140));

  const r2 = await post(payload, stripe.webhooks.generateTestHeaderString({ payload, secret }));
  const j2 = await r2.json().catch(() => ({}));
  check("ayni event tekrar: duplicate", r2.status === 200 && j2.duplicate === true, JSON.stringify(j2).slice(0, 100));

  const refundId = "evt_test_r_" + rid;
  const refundEvt = { id: refundId, object: "event", type: "charge.refunded", livemode: false, api_version: "2024-06-20",
    data: { object: { id: "ch_test_" + rid, object: "charge", refunded: true, amount_refunded: 125000, payment_intent: "pi_test_" + rid } } };
  const refundPayload = JSON.stringify(refundEvt);
  const r4 = await post(refundPayload, stripe.webhooks.generateTestHeaderString({ payload: refundPayload, secret }));
  check("iade eventi kabul", r4.status === 200, "HTTP " + r4.status);
  const pay2 = await rest("GET", "billing_payments?select=status&stripe_checkout_session_id=eq." + sesId);
  check("odeme refunded oldu", pay2.json && pay2.json[0] && pay2.json[0].status === "refunded", pay2.text.slice(0, 100));
  const ent2 = await rest("GET", "workspace_entitlements?select=status&workspace_id=eq." + wsId);
  check("entitlement inactive oldu", ent2.json && ent2.json[0] && ent2.json[0].status === "inactive", ent2.text.slice(0, 100));

  const r3 = await post(payload, "t=1,v1=bozuk");
  check("hatali imza reddedilir", r3.status === 400, "HTTP " + r3.status);
} catch (e) {
  console.error("[HATA] " + e);
  checks.push(false);
} finally {
  if (wsId) {
    const del = async (p) => { const r = await rest("DELETE", p); console.log("  temizlik " + p.split("?")[0] + ": HTTP " + r.status); };
    await del("billing_events?stripe_event_id=eq." + evtId);
    await del("billing_events?stripe_event_id=eq.evt_test_r_" + rid);
    await del("billing_payments?stripe_checkout_session_id=eq." + sesId);
    await del("workspace_entitlements?workspace_id=eq." + wsId);
    await del("billing_customers?workspace_id=eq." + wsId);
    await del("workspaces?id=eq." + wsId);
  }
}
console.log(checks.every(Boolean) && checks.length ? "SONUC: GECTI" : "SONUC: KALDI");
process.exit(checks.every(Boolean) && checks.length ? 0 : 1);