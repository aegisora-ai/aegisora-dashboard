import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const field = (v) => (v === null || v === undefined) ? "~" : Buffer.byteLength(String(v), "utf8") + ":" + v;
function ts(s) {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.(\d+))?(?:\+00:00|Z)$/.exec(s);
  if (!m) throw new Error("created_at biçimi tanınmadı: " + s);
  return `${m[1]}T${m[2]}.${(m[3] || "").padEnd(6, "0")}Z`;
}
function v2material(r) {
  return ["v2", field(r.prev_hash), field(r.workspace_id), field(String(r.seq)), field(r.id),
    field(r.decision_id), field(r.action), field(r.decision), field(r.trace_id),
    field(ts(r.created_at)), field(r.payload_text)].join("|");
}

const db = createClient(url, key, { auth: { persistSession: false } });
const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await db.from("evidence")
    .select("id,workspace_id,seq,decision_id,action,decision,trace_id,created_at,prev_hash,hash,hash_version,payload_text:payload::text")
    .eq("workspace_id", WS).order("seq", { ascending: true }).range(from, from + 999);
  if (error) { console.error("Sorgu hatasi:", error.message); process.exit(1); }
  rows.push(...data);
  if (data.length < 1000) break;
}

let prev = "GENESIS", prevSeq = 0, firstV2Fail = null;
const byVer = {}, problems = [];
for (const r of rows) {
  const v = String(r.hash_version);
  byVer[v] ??= { adet: 0, hash_uyusmaz: 0 };
  byVer[v].adet++;
  if (r.seq !== prevSeq + 1) problems.push({ seq: r.seq, sorun: "seq boslugu" });
  if (r.prev_hash !== prev) problems.push({ seq: r.seq, sorun: "prev_hash baglanti" });
  const expected = Number(r.hash_version) >= 2 ? sha(v2material(r)) : sha(r.payload_text);
  if (expected !== r.hash) {
    byVer[v].hash_uyusmaz++;
    problems.push({ seq: r.seq, v, sorun: "hash uyusmuyor" });
    if (!firstV2Fail && Number(r.hash_version) >= 2) firstV2Fail = { seq: r.seq, material: v2material(r), beklenen: expected, db: r.hash };
  }
  prev = r.hash; prevSeq = r.seq;
}
const last = rows[rows.length - 1];
console.log({ toplam: rows.length, surumlere_gore: byVer, sorun_sayisi: problems.length });
if (problems.length) console.log("Ilk 5 sorun:", problems.slice(0, 5));
if (firstV2Fail) console.log("Ilk v2 hatasi (debug):", firstV2Fail);
if (last) console.log("CIPA ADAYI -> son seq:", last.seq, "son hash:", last.hash);
process.exit(problems.length ? 1 : 0);
