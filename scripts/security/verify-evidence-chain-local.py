"""Exercise the repository's evidence-chain SQL in a disposable local PostgreSQL database."""
import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

import psycopg2
from psycopg2 import sql

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = (ROOT / "supabase/003_core.sql").read_text(encoding="utf-8")
DB_NAME = "aegisora_evidence_chain_" + uuid.uuid4().hex[:12]
checks = []
database_created = False


def pg_connect(database):
    return psycopg2.connect(
        host=os.environ.get("AEGISORA_TEST_PGHOST", "127.0.0.1"),
        port=os.environ.get("AEGISORA_TEST_PGPORT", "5432"),
        dbname=database,
        user=os.environ.get("AEGISORA_TEST_PGUSER", "postgres"),
        password=os.environ.get("AEGISORA_TEST_PGPASSWORD", ""),
    )


def check(name, passed):
    checks.append({"name": name, "pass": bool(passed)})
    if not passed:
        raise AssertionError(name)


def extract(pattern, label):
    match = re.search(pattern, SCHEMA, flags=re.IGNORECASE)
    if not match:
        raise RuntimeError(f"Could not locate {label} in supabase/003_core.sql")
    return match.group(0)


evidence_table = extract(r"create table if not exists public\.evidence\s*\([\s\S]*?\n\);", "evidence table")
chain_fn = extract(r"create or replace function public\.evidence_chain\(\)[\s\S]*?\$\$;", "evidence_chain function")
immutable_fn = extract(r"create or replace function public\.evidence_immutable\(\)[\s\S]*?\$\$;", "evidence_immutable function")
verify_fn = extract(r"create or replace function public\.verify_evidence_chain\(ws uuid\)[\s\S]*?\$\$;", "verify_evidence_chain function")

admin = pg_connect("postgres")
admin.autocommit = True
try:
    with admin.cursor() as cursor:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
        database_created = True
finally:
    admin.close()

try:
    conn = pg_connect(DB_NAME)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE SCHEMA extensions")
    cur.execute("CREATE EXTENSION pgcrypto WITH SCHEMA extensions")
    cur.execute("CREATE TABLE public.workspaces (id uuid PRIMARY KEY)")
    cur.execute("CREATE TABLE public.agents (id uuid PRIMARY KEY)")
    cur.execute("CREATE TABLE public.executions (id uuid PRIMARY KEY)")
    cur.execute("CREATE FUNCTION public.is_member(ws uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT true $$")
    cur.execute(evidence_table)
    cur.execute(chain_fn)
    cur.execute(immutable_fn)
    cur.execute(verify_fn)
    cur.execute("CREATE TRIGGER evidence_chain_trg BEFORE INSERT ON public.evidence FOR EACH ROW EXECUTE FUNCTION public.evidence_chain()")
    cur.execute("CREATE TRIGGER evidence_immutable_trg BEFORE UPDATE OR DELETE ON public.evidence FOR EACH ROW EXECUTE FUNCTION public.evidence_immutable()")

    workspace_id = str(uuid.uuid4())
    cur.execute("INSERT INTO public.workspaces VALUES (%s)", (workspace_id,))
    cur.execute("INSERT INTO public.evidence (workspace_id,payload) VALUES (%s,%s::jsonb)", (workspace_id, '{"n":1}'))
    cur.execute("INSERT INTO public.evidence (workspace_id,payload) VALUES (%s,%s::jsonb)", (workspace_id, '{"n":2}'))
    cur.execute("SELECT seq,prev_hash,hash FROM public.evidence WHERE workspace_id=%s ORDER BY seq", (workspace_id,))
    rows = cur.fetchall()
    check("insert trigger assigns contiguous sequence and GENESIS first link", len(rows) == 2 and rows[0][0] == 1 and rows[0][1] == "GENESIS" and rows[1][0] == 2)
    check("second evidence row links to the previous row hash", rows[1][1] == rows[0][2] and rows[0][2] != rows[1][2])
    cur.execute("SELECT total,broken FROM public.verify_evidence_chain(%s)", (workspace_id,))
    check("verifier accepts the untampered evidence chain", cur.fetchone() == (2, 0))

    try:
        cur.execute("UPDATE public.evidence SET payload='{}'::jsonb WHERE workspace_id=%s AND seq=1", (workspace_id,))
        check("append-only trigger rejects UPDATE", False)
    except psycopg2.Error as exc:
        check("append-only trigger rejects UPDATE", "append-only" in str(exc).lower())
        conn.rollback()
    try:
        cur.execute("DELETE FROM public.evidence WHERE workspace_id=%s AND seq=1", (workspace_id,))
        check("append-only trigger rejects DELETE", False)
    except psycopg2.Error as exc:
        check("append-only trigger rejects DELETE", "append-only" in str(exc).lower())
        conn.rollback()

    cur.execute("ALTER TABLE public.evidence DISABLE TRIGGER evidence_immutable_trg")
    cur.execute("UPDATE public.evidence SET payload='{" + '"n":99' + "}'::jsonb WHERE workspace_id=%s AND seq=1", (workspace_id,))
    cur.execute("ALTER TABLE public.evidence ENABLE TRIGGER evidence_immutable_trg")
    cur.execute("SELECT total,broken FROM public.verify_evidence_chain(%s)", (workspace_id,))
    total, broken = cur.fetchone()
    check("verifier detects tampering after an out-of-band privileged modification", total == 2 and broken > 0)
    conn.close()
finally:
    if database_created:
        cleanup = pg_connect("postgres")
        cleanup.autocommit = True
        with cleanup.cursor() as cursor:
            cursor.execute(sql.SQL("DROP DATABASE IF EXISTS {} WITH (FORCE)").format(sql.Identifier(DB_NAME)))
        cleanup.close()

result = {
    "status": "PASS" if all(item["pass"] for item in checks) else "FAIL",
    "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    "environment": "disposable local PostgreSQL database using function/table definitions extracted from supabase/003_core.sql; hosted project unchanged",
    "checks": checks,
    "cleanup": {"database_removed": True},
    "hosted_runtime_verified": False,
}
(ROOT / ".enterprise/phase-c23-evidence-chain.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result, indent=2))
if result["status"] != "PASS":
    raise SystemExit(1)
