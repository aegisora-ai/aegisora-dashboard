import { readFileSync, appendFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const WS = process.env.WS || "077e6bf1-8473-4570-9bfb-cf4196cbebb6";
const mode = process.argv[2] || "check";
const FILE = "C:/AI/AEGISORA/anchors/evidence-anchors.jsonl";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("URL veya servis anahtari yok"); process.exit(1); }
const project = new URL(url).host.split(".")[0];
const db = createClient(url, key, { auth: { persistSession: false } });

const { data: v, error: ve } = await db.rpc("evidence_verify_core", { ws: WS });
if (ve) { console.error("Dogrulama hatasi:", ve.message); process.exit(1); }
const total = Number(v?.[0]?.total ?? 0), broken = Number(v?.[0]?.broken ?? -1);
console.log({ proje: project, workspace: WS, toplam: total, bozuk: broken });

if (mode === "save") {
  if (broken !== 0) { console.error("Zincir bozuk, cipa kaydedilmedi."); process.exit(1); }
  const { data: last, error } = await db.from("evidence").select("seq,hash").eq("workspace_id", WS).order("seq", { ascending: false }).limit(1).single();
  if (error) { console.error(error.message); process.exit(1); }
  const rec = { saved_at: new Date().toISOString(), project, workspace: WS, total, seq: last.seq, hash: last.hash };
  appendFileSync(FILE, JSON.stringify(rec) + "\n");
  console.log("CIPA KAYDEDILDI:", rec);
  process.exit(0);
}

if (!existsSync(FILE)) { console.error("Cipa dosyasi yok. Once: node scripts\\chain-anchor.mjs save"); process.exit(1); }
const anchors = readFileSync(FILE, "utf8").split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)).filter((a) => a.workspace === WS && a.project === project);
let bad = 0;
for (const a of anchors) {
  const { data: row } = await db.from("evidence").select("hash").eq("workspace_id", WS).eq("seq", a.seq).maybeSingle();
  const ok = row && row.hash === a.hash;
  if (!ok) bad++;
  console.log(ok ? "ESLESTI " : "UYUSMUYOR", "seq", a.seq, a.saved_at, row ? "" : "(kayit yok: silinmis olabilir)");
}
console.log(bad === 0 ? "SONUC: tum cipalar dogru, zincir " + total + " kayit, bozuk " + broken : "SONUC: " + bad + " cipa UYUSMUYOR");
process.exit(bad || broken ? 1 : 0);