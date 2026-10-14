#!/usr/bin/env python3
"""verify_evidence.py - offline verifier for the Aegisora evidence hash chain (stdlib only, ASCII only).

  python verify_evidence.py export.json
  python verify_evidence.py export.json --workspace <uuid> --expect-head <hash> --expect-seq <n>

Signed anchors (pip install cryptography):
  python verify_evidence.py --keygen aegisora-anchor
  python verify_evidence.py export.json --workspace <uuid> --sign aegisora-anchor.key.pem
  python verify_evidence.py export.json --anchor anchor-xxxx.json --pubkey aegisora-anchor.pub.pem

Exit code 0 = ok, 1 = chain broken / anchor mismatch, 2 = usage/input error.
"""
import argparse, base64, datetime, hashlib, json, sys
from decimal import Decimal


def sha(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def field(v):
    return "~" if v is None else "%d:%s" % (len(v.encode("utf-8")), v)


def hash_v1(r):
    return sha(r["prev_hash"] + "|" + r["id"] + "|" + (r.get("decision_id") or "") + "|" + r["payload_text"])


def hash_v2(r):
    parts = ["v2", field(r["prev_hash"]), field(r["workspace_id"]), field(str(r["seq"])), field(r["id"]),
             field(r.get("decision_id")), field(r.get("action")), field(r.get("decision")),
             field(r.get("trace_id")), field(r["created_at_utc"]), field(r["payload_text"])]
    return sha("|".join(parts))


def jsonb_text(v):
    """Best-effort re-creation of PostgreSQL jsonb::text (only used if payload_text is missing)."""
    if v is None: return "null"
    if v is True: return "true"
    if v is False: return "false"
    if isinstance(v, str): return json.dumps(v, ensure_ascii=False)
    if isinstance(v, (int, Decimal)): return str(v)
    if isinstance(v, list): return "[" + ", ".join(jsonb_text(x) for x in v) + "]"
    if isinstance(v, dict):
        keys = sorted(v, key=lambda k: (len(k.encode("utf-8")), k.encode("utf-8")))
        return "{" + ", ".join(json.dumps(k, ensure_ascii=False) + ": " + jsonb_text(v[k]) for k in keys) + "}"
    raise ValueError("unsupported type")


def load(path):
    raw = open(path, "rb").read()
    if raw[:2] in (b"\xff\xfe", b"\xfe\xff"): text = raw.decode("utf-16")
    else: text = raw.decode("utf-8-sig")
    data = json.loads(text, parse_float=Decimal)
    recs = data["records"] if isinstance(data, dict) else data
    if len(recs) == 1 and isinstance(recs[0], dict) and "export_json" in recs[0]:
        recs = json.loads(recs[0]["export_json"])["records"]
    for r in recs:
        if "payload_text" not in r:
            r["payload_text"] = jsonb_text(r.get("payload"))
            r["_guessed"] = True
    return recs


def verify_chain(recs):
    recs = sorted(recs, key=lambda r: r["seq"])
    prev, problems = "GENESIS", []
    for i, r in enumerate(recs, 1):
        if r["seq"] != i: problems.append((r["seq"], "seq not gapless (expected %d)" % i))
        if r["prev_hash"] != prev: problems.append((r["seq"], "prev_hash does not match previous record"))
        ver = int(r.get("hash_version", 1))
        exp = hash_v2(r) if ver == 2 else hash_v1(r)
        if exp != r["hash"]:
            problems.append((r["seq"], "hash mismatch (v%d)%s" % (ver, " [payload re-created, not exact]" if r.get("_guessed") else "")))
        prev = r["hash"]
    return recs, problems


def canon(o):
    return json.dumps(o, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("export", nargs="?")
    ap.add_argument("--workspace"); ap.add_argument("--expect-head"); ap.add_argument("--expect-seq", type=int)
    ap.add_argument("--sign"); ap.add_argument("--keygen"); ap.add_argument("--anchor"); ap.add_argument("--pubkey")
    a = ap.parse_args()

    if a.keygen:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
        from cryptography.hazmat.primitives import serialization as S
        k = Ed25519PrivateKey.generate()
        open(a.keygen + ".key.pem", "wb").write(k.private_bytes(S.Encoding.PEM, S.PrivateFormat.PKCS8, S.NoEncryption()))
        open(a.keygen + ".pub.pem", "wb").write(k.public_key().public_bytes(S.Encoding.PEM, S.PublicFormat.SubjectPublicKeyInfo))
        print("Keys written: %s.key.pem (SECRET, keep offline) and %s.pub.pem (can be shared)" % (a.keygen, a.keygen))
        return 0
    if not a.export:
        ap.print_usage(); return 2

    recs = load(a.export)
    by_ws = {}
    for r in recs: by_ws.setdefault(r["workspace_id"], []).append(r)
    if a.workspace:
        by_ws = {k: v for k, v in by_ws.items() if k == a.workspace}
        if not by_ws: print("Workspace not found in export."); return 2

    bad, heads = 0, {}
    for ws, rs in by_ws.items():
        rs, problems = verify_chain(rs)
        v1 = sum(1 for r in rs if int(r.get("hash_version", 1)) == 1)
        head = rs[-1] if rs else None
        heads[ws] = head
        if problems:
            bad += 1
            print("ZINCIR BOZUK  %s  (%d kayit, %d sorunlu)" % (ws, len(rs), len(problems)))
            for seq, msg in problems: print("   seq %s: %s" % (seq, msg))
        else:
            print("ZINCIR SAGLAM (%d/%d)  %s  v1=%d v2=%d  head seq=%s hash=%s" % (
                len(rs), len(rs), ws, v1, len(rs) - v1, head["seq"] if head else "-", head["hash"] if head else "-"))

    if a.expect_head or a.expect_seq:
        if len(by_ws) != 1: print("--expect-head/--expect-seq need exactly one workspace (use --workspace)."); return 2
        h = list(heads.values())[0]
        if a.expect_head and (not h or h["hash"] != a.expect_head):
            print("HEAD ESLESMIYOR: beklenen %s, bulunan %s" % (a.expect_head, h and h["hash"])); bad += 1
        if a.expect_seq and (not h or h["seq"] < a.expect_seq):
            print("KAYIT EKSIK: beklenen en az seq %d, bulunan %s" % (a.expect_seq, h and h["seq"])); bad += 1

    if a.anchor:
        from cryptography.hazmat.primitives import serialization as S
        from cryptography.exceptions import InvalidSignature
        body = open(a.anchor, "rb").read()
        sig = base64.b64decode(open(a.anchor + ".sig", "rb").read())
        pub = S.load_pem_public_key(open(a.pubkey, "rb").read())
        try: pub.verify(sig, body)
        except InvalidSignature: print("ANKER IMZASI GECERSIZ"); return 1
        an = json.loads(body)
        mine = [r for r in by_ws.get(an["workspace_id"], []) if r["seq"] == an["head_seq"]]
        if mine and mine[0]["hash"] == an["head_hash"]:
            print("ANKER TAMAM: seq %s hash eslesiyor (imza gecerli, %s)" % (an["head_seq"], an["exported_at"]))
        else:
            print("ANKER UYUSMUYOR: ankerlenen kayit export'ta yok veya degismis"); bad += 1

    if a.sign:
        if bad or len(by_ws) != 1: print("Imzalamak icin zincir saglam olmali ve --workspace verilmeli."); return 1
        from cryptography.hazmat.primitives import serialization as S
        ws, h = list(heads.items())[0]
        an = {"workspace_id": ws, "head_seq": h["seq"], "head_hash": h["hash"], "records": len(by_ws[ws]),
              "exported_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "format": "aegisora-anchor-v1"}
        body = canon(an).encode("utf-8")
        key = S.load_pem_private_key(open(a.sign, "rb").read(), None)
        name = "anchor-%s-%s.json" % (ws[:8], an["exported_at"][:10])
        open(name, "wb").write(body); open(name + ".sig", "wb").write(base64.b64encode(key.sign(body)))
        print("Anker yazildi: %s (+ .sig). Dosyayi disarida sakla (e-posta, ayri depo, musteri)." % name)

    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())