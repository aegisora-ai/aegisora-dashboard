import { readFile, writeFile } from "node:fs/promises";

const files = {
  pitch: "docs/enterprise/one-page-pitch.md",
  icp: "docs/enterprise/pilot-icp.md",
  caseStudy: "docs/enterprise/pilot-case-study-template.md",
  dataRoom: "docs/enterprise/data-room-index.md",
  discovery: "docs/enterprise/pilot-customer-discovery.md",
};
const content = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8").then((text) => text.toLowerCase())])));
const checks = [
  { id: "pitch_states_pilot_stage", pass: content.pitch.includes("seeking design partners") && content.pitch.includes("production deployment") },
  { id: "pitch_has_no_unqualified_cloud_claim", pass: !content.pitch.includes("managed cloud\n") && content.pitch.includes("no customer production deployment is verified") },
  { id: "pitch_separates_local_evidence_from_production", pass: content.pitch.includes("not a production deployment") },
  { id: "three_icps_present", pass: ["icp 1", "icp 2", "icp 3"].every((label) => content.icp.includes(label)) },
  { id: "case_study_requires_approved_evidence", pass: content.caseStudy.includes("verified outcomes") && content.caseStudy.includes("written approval") },
  { id: "data_room_is_a_structure_not_fabricated_data", pass: ["corporate", "product", "security", "compliance", "metrics", "customers", "finance"].every((label) => content.dataRoom.includes(`## ${label}`)) },
  { id: "customer_discovery_has_qualification_and_guardrails", pass: content.discovery.includes("qualification gate") && content.discovery.includes("do not claim customers") },
];
const result = {
  controls: ["C49", "C50", "C51", "C52"],
  timestamp_utc: new Date().toISOString(),
  status: checks.every((check) => check.pass) ? "PASS" : "FAIL",
  checks,
  note: "Verifies existence and truthfulness guardrails of sales templates/playbook; it proves no customers, revenue, conversion, or measured outcomes.",
};
await writeFile(".enterprise/phase-c49-c52-sales-artifacts.json", `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (result.status !== "PASS") process.exitCode = 1;
