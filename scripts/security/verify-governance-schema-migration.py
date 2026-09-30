import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

import psycopg2
from psycopg2 import sql

ROOT = Path(__file__).resolve().parents[2]
CORE = (ROOT / "supabase/003_core.sql").read_text(encoding="utf-8")
MIGRATION = (ROOT / "supabase/migrations/20260927190000_align_governance_runtime_schema.sql").read_text(encoding="utf-8")
checks = []
created = []


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


def table_sql(name):
    match = re.search(rf"create table if not exists public\.{name}\s*\([\s\S]*?\n\);", CORE, re.I)
    if not match:
        raise RuntimeError(f"Missing canonical {name} definition in 003_core.sql")
    return match.group(0)


admin = pg_connect("postgres")
admin.autocommit = True


def create_db():
    name = "aegisora_schema_" + uuid.uuid4().hex[:12]
    with admin.cursor() as cur:
        cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
    created.append(name)
    return name


def connect_db(name):
    conn = pg_connect(name)
    conn.autocommit = True
    return conn


def execute_migration(cur):
    cur.execute(MIGRATION)


def columns(cur, table):
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=%s", (table,))
    return {row[0] for row in cur.fetchall()}


try:
    # Upgrade fixture reproduces the repository's former effect/status model,
    # including persisted values and an already-existing executions table.
    upgrade_db = create_db()
    conn = connect_db(upgrade_db)
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION pgcrypto")
    cur.execute("CREATE TABLE public.workspaces (id uuid PRIMARY KEY)")
    cur.execute("CREATE TABLE public.agents (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.workspaces(id), name text NOT NULL, status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended'))) ")
    cur.execute("CREATE TABLE public.policies (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.workspaces(id), name text NOT NULL, effect text NOT NULL CHECK (effect IN ('ALLOW','BLOCK','ESCALATE'))) ")
    # Match the measured live legacy table: decision is present, but the detail
    # columns required by the repository's canonical model are absent.
    cur.execute("CREATE TABLE public.decisions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.workspaces(id), agent_id uuid, decision text NOT NULL CHECK (decision IN ('ALLOW','BLOCK','ESCALATE')), reason text, policy_id uuid, risk_score int NOT NULL DEFAULT 0, trace_id text, created_at timestamptz NOT NULL DEFAULT now())")
    cur.execute("CREATE TABLE public.executions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.workspaces(id), agent_id uuid, action text NOT NULL, decision text NOT NULL, trace_id text, risk_score int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now())")
    cur.execute("CREATE TABLE public.evidence (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.workspaces(id), seq bigint NOT NULL, decision_id uuid, trace_id text, payload jsonb NOT NULL, prev_hash text NOT NULL, hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(workspace_id,seq))")
    ws, agent, policy, decision = [str(uuid.uuid4()) for _ in range(4)]
    cur.execute("INSERT INTO public.workspaces VALUES (%s)", (ws,))
    cur.execute("INSERT INTO public.agents(id,workspace_id,name) VALUES (%s,%s,'agent-a')", (agent, ws))
    cur.execute("INSERT INTO public.policies(id,workspace_id,name,effect) VALUES (%s,%s,'read', 'ALLOW')", (policy, ws))
    cur.execute("INSERT INTO public.decisions(id,workspace_id,agent_id,decision,policy_id) VALUES (%s,%s,%s,'BLOCK',%s)", (decision, ws, agent, policy))
    execute_migration(cur)
    execute_migration(cur)  # idempotence on an already-upgraded schema
    cols = {table: columns(cur, table) for table in ["agents", "policies", "decisions", "executions", "evidence"]}
    check("upgrade aligns legacy agent/policy fields and retains the live decision field", "state" in cols["agents"] and "status" not in cols["agents"] and "decision" in cols["policies"] and "effect" not in cols["policies"] and "decision" in cols["decisions"] and "effect" not in cols["decisions"])
    cur.execute("SELECT state FROM public.agents WHERE id=%s", (agent,))
    check("legacy agent state is normalized without losing its meaning", cur.fetchone()[0] == "ACTIVE")
    cur.execute("SELECT decision FROM public.policies WHERE id=%s", (policy,))
    check("legacy policy value is preserved through column rename", cur.fetchone()[0] == "ALLOW")
    cur.execute("SELECT decision,agent_name,action,resource FROM public.decisions WHERE id=%s", (decision,))
    check("legacy decision survives while missing historical details get explicit non-sensitive sentinels", cur.fetchone() == ("BLOCK", "unknown", "unknown", ""))
    check("upgrade adds the evidence-to-execution/agent/action/decision contract", {"execution_id", "agent_id", "action", "decision"}.issubset(cols["evidence"]))
    conn.close()

    # Fresh-install fixture executes the canonical core table definitions, then
    # ensures the upgrade migration is safe after them as well.
    fresh_db = create_db()
    conn = connect_db(fresh_db)
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION pgcrypto")
    cur.execute("CREATE TABLE public.workspaces (id uuid PRIMARY KEY)")
    for table in ["agents", "policies", "decisions", "executions", "evidence"]:
        cur.execute(table_sql(table))
    execute_migration(cur)
    execute_migration(cur)
    cols = {table: columns(cur, table) for table in ["agents", "policies", "decisions", "executions", "evidence"]}
    check("fresh core schema and upgrade migration converge idempotently", "state" in cols["agents"] and "decision" in cols["policies"] and "decision" in cols["decisions"] and "decision" in cols["executions"] and {"execution_id", "agent_id", "action", "decision"}.issubset(cols["evidence"]))
    conn.close()
finally:
    for name in created:
        cleanup = pg_connect("postgres")
        cleanup.autocommit = True
        with cleanup.cursor() as cur:
            cur.execute(sql.SQL("DROP DATABASE IF EXISTS {} WITH (FORCE)").format(sql.Identifier(name)))
        cleanup.close()
    admin.close()

report = {
    "status": "PASS" if all(item["pass"] for item in checks) else "FAIL",
    "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    "environment": "disposable local PostgreSQL databases; legacy upgrade and fresh core schema both exercised; hosted database unchanged",
    "checks": checks,
    "cleanup": {"databases_removed": len(created)},
    "hosted_migration_applied": False,
}
output = ROOT / ".enterprise/phase-schema-migration.json"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
if report["status"] != "PASS":
    raise SystemExit(1)
