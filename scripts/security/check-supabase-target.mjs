import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd(), false);
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!projectUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
const runtimeProject = new URL(projectUrl).hostname.split(".")[0];
const linkedRef = (await readFile("supabase/.temp/project-ref", "utf8")).trim();
let poolerRef = null;
try {
  const pooler = new URL((await readFile("supabase/.temp/pooler-url", "utf8")).trim());
  poolerRef = pooler.username.split(".").at(-1) ?? null;
} catch { /* no usable linked pooler URL */ }

const targetMatches = runtimeProject === linkedRef && runtimeProject === poolerRef;
const output = {
  runtime_project_ref: runtimeProject,
  supabase_cli_linked_project_ref: linkedRef,
  supabase_cli_pooler_project_ref: poolerRef,
  target_matches: targetMatches,
  migration_allowed: targetMatches,
};
console.log(JSON.stringify(output, null, 2));
if (!targetMatches) process.exitCode = 2;
