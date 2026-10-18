import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const WS = process.env.WS || "077e6bf1-8473-4570-9bfb-cf4196cbebb6";
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("URL veya servis anahtari yok"); process.exit(1); }
console.log("Proje:", new URL(url).host.split(".")[0], "| workspace:", WS);
const db = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await db.rpc("evidence_verify_core", { ws: WS });
if (error) { console.error("RPC hatasi:", error.message); process.exit(1); }
const r = Array.isArray(data) ? data[0] : data;
console.log({ toplam: r.total, bozuk: r.broken });
const { data: last } = await db.from("evidence").select("seq,hash").eq("workspace_id", WS).order("seq", { ascending: false }).limit(1);
if (last?.[0]) console.log("CIPA ADAYI -> son seq:", last[0].seq, "son hash:", last[0].hash);
process.exit(Number(r.broken) ? 1 : 0);
